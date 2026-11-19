import { lookup } from "node:dns/promises";
import http, { type IncomingHttpHeaders, type RequestOptions } from "node:http";
import https from "node:https";
import net from "node:net";
import type { WebsiteCheck } from "@/lib/types";
import { checkWebRiskUrl } from "@/lib/web-risk";

const MAX_HTML_BYTES = 500_000;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 3;

type PinnedResponse = {
  status: number;
  headers: IncomingHttpHeaders;
  body: string;
  truncated: boolean;
};

function normalizeHost(host: string) {
  return host.toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
}

function ipv4Number(address: string) {
  return address.split(".").reduce((value, part) => ((value << 8) | Number(part)) >>> 0, 0);
}

function inIpv4Range(address: string, network: string, prefix: number) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ipv4Number(address) & mask) === (ipv4Number(network) & mask);
}

function isPrivateIp(address: string) {
  const version = net.isIP(address);
  if (version === 4) {
    return [
      ["0.0.0.0", 8],
      ["10.0.0.0", 8],
      ["100.64.0.0", 10],
      ["127.0.0.0", 8],
      ["169.254.0.0", 16],
      ["172.16.0.0", 12],
      ["192.0.0.0", 24],
      ["192.0.2.0", 24],
      ["192.88.99.0", 24],
      ["192.168.0.0", 16],
      ["198.18.0.0", 15],
      ["198.51.100.0", 24],
      ["203.0.113.0", 24],
      ["224.0.0.0", 4],
      ["240.0.0.0", 4],
    ].some(([network, prefix]) => inIpv4Range(address, String(network), Number(prefix)));
  }

  if (version === 6) {
    const firstHextet = address.toLowerCase().split(":")[0];
    // Only global-unicast 2000::/3 addresses are accepted. This also rejects
    // loopback, link-local, unique-local, multicast, mapped, and unspecified IPs.
    return !/^[23]/.test(firstHextet) || address.toLowerCase().startsWith("2001:db8:");
  }

  return true;
}

async function validatePublicHttpUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("The supplied value is not a valid URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }
  if (url.username || url.password) {
    throw new Error("URLs containing embedded credentials are not allowed.");
  }
  if (url.port && url.port !== (url.protocol === "https:" ? "443" : "80")) {
    throw new Error("Non-standard URL ports are not allowed.");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".invalid")
  ) {
    throw new Error("Private or local network hostnames cannot be scanned.");
  }

  const ipVersion = net.isIP(hostname);
  if (ipVersion) {
    if (isPrivateIp(hostname)) {
      throw new Error("Private or reserved IP addresses cannot be scanned.");
    }
    return url;
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isPrivateIp(record.address))) {
    throw new Error("The domain does not resolve exclusively to public IP addresses.");
  }

  return url;
}

async function requestPinnedPublicUrl(url: URL): Promise<PinnedResponse> {
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const ipVersion = net.isIP(hostname);
  const records = ipVersion
    ? [{ address: hostname, family: ipVersion }]
    : await lookup(hostname, { all: true, verbatim: true });

  if (!records.length || records.some((record) => isPrivateIp(record.address))) {
    throw new Error("The domain does not resolve exclusively to public IP addresses.");
  }

  const selected = records[0];
  const requestOptions: RequestOptions = {
    hostname: selected.address,
    family: selected.family,
    port: url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80,
    path: `${url.pathname}${url.search}`,
    method: "GET",
    agent: false,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      host: url.host,
      "user-agent": "InternShieldAI-WebsiteVerifier/1.0",
      accept: "text/html,application/xhtml+xml",
    },
  };

  return new Promise((resolve, reject) => {
    let settled = false;
    const client = url.protocol === "https:" ? https : http;
    const options = url.protocol === "https:"
      ? {
          ...requestOptions,
          servername: ipVersion ? undefined : hostname,
        }
      : requestOptions;
    const request = client.request(options, (response) => {
      const chunks: Buffer[] = [];
      let totalBytes = 0;
      let truncated = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        resolve({
          status: response.statusCode ?? 0,
          headers: response.headers,
          body: Buffer.concat(chunks).toString("utf8"),
          truncated,
        });
      };

      response.on("data", (value: Buffer | string) => {
        const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
        const remaining = Math.max(0, MAX_HTML_BYTES - totalBytes);
        if (remaining > 0) {
          const limitedChunk = chunk.subarray(0, remaining);
          chunks.push(limitedChunk);
          totalBytes += limitedChunk.byteLength;
        }
        if (chunk.byteLength > remaining) {
          truncated = true;
          finish();
          response.destroy();
        }
      });
      response.once("end", finish);
      response.once("error", (error) => {
        if (!settled) {
          settled = true;
          reject(error);
        }
      });
    });

    request.once("error", (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    request.end();
  });
}

function stripHtml(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .slice(0, 100_000);
}

function companyTokens(company: string) {
  const ignored = new Set([
    "private", "limited", "ltd", "pvt", "llp", "inc", "incorporated",
    "company", "co", "technologies", "technology", "solutions", "india",
  ]);
  return company
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !ignored.has(token));
}

function checkCompanyName(company: string, pageText: string) {
  const tokens = companyTokens(company);
  if (!tokens.length) return "not_checked" as const;
  const normalizedPage = pageText.toLowerCase();
  const matched = tokens.filter((token) => normalizedPage.includes(token));
  return matched.length >= Math.min(2, tokens.length)
    ? ("match" as const)
    : ("no_match" as const);
}

function emailDomain(email: string) {
  const at = email.lastIndexOf("@");
  return at > 0 ? normalizeHost(email.slice(at + 1)) : "";
}

function domainsMatch(first: string, second: string) {
  return first === second || first.endsWith(`.${second}`) || second.endsWith(`.${first}`);
}

function webRiskEvidence(check: WebsiteCheck["webRisk"]) {
  if (check.status === "threat") {
    return `Google Web Risk reported a potential threat: ${check.threatTypes.join(", ")}.`;
  }
  if (check.status === "clear") {
    return "Google Web Risk found no current threat-list match for the submitted URL.";
  }
  if (check.status === "quota_reached") {
    return "Google Web Risk lookup was skipped because this app reached its monthly free-use cap.";
  }
  if (check.status === "not_configured") {
    return "Google Web Risk is not configured, so threat-list reputation was not checked.";
  }
  return "Google Web Risk could not complete the lookup.";
}

export async function inspectWebsite(
  rawUrl: string,
  company: string,
  recruiterEmail: string
): Promise<WebsiteCheck> {
  let currentUrl = await validatePublicHttpUrl(rawUrl);
  const requestedUrl = currentUrl.toString();
  const initialDomain = normalizeHost(currentUrl.hostname);
  const redirects: string[] = [];
  const limitations: string[] = [];
  let response: PinnedResponse | undefined;
  let networkError: string | undefined;

  const webRisk = await checkWebRiskUrl(requestedUrl);
  const webRiskText = webRiskEvidence(webRisk);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    try {
      currentUrl = await validatePublicHttpUrl(currentUrl.toString());
      response = await requestPinnedPublicUrl(currentUrl);
    } catch (error) {
      networkError = error instanceof Error ? error.message : "The website request failed.";
      break;
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const locationHeader = response.headers.location;
      const location = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader;
      if (!location) break;
      if (hop === MAX_REDIRECTS) {
        networkError = "The website exceeded the allowed redirect limit.";
        break;
      }
      try {
        currentUrl = new URL(location, currentUrl);
        redirects.push(currentUrl.toString());
      } catch {
        networkError = "The website returned an invalid redirect destination.";
        break;
      }
      response = undefined;
      continue;
    }
    break;
  }

  const evidence: string[] = [webRiskText];
  if (networkError || !response) {
    limitations.push(networkError ?? "No response was received from the website.");
    if (webRisk.status !== "clear" && webRisk.status !== "threat") {
      limitations.push("The submitted URL did not receive a threat-reputation result.");
    }
    return {
      status: "unavailable",
      requestedUrl,
      https: currentUrl.protocol === "https:",
      redirects,
      domain: normalizeHost(currentUrl.hostname),
      companyNameMatch: "not_checked",
      recruiterDomainMatch: recruiterEmail ? "not_checked" : "not_provided",
      evidence,
      limitations,
      webRisk,
    };
  }

  const finalDomain = normalizeHost(currentUrl.hostname);
  const contentTypeHeader = response.headers["content-type"];
  const contentType = Array.isArray(contentTypeHeader) ? contentTypeHeader[0] ?? "" : contentTypeHeader ?? "";
  const html = contentType.toLowerCase().includes("text/html") ? response.body : "";

  evidence.push(`Website responded with HTTP ${response.status}.`);
  evidence.push(currentUrl.protocol === "https:" ? "Final website URL uses HTTPS." : "Final website URL does not use HTTPS.");
  if (redirects.length) evidence.push(`Website redirected ${redirects.length} time(s).`);
  if (initialDomain !== finalDomain) evidence.push(`The URL redirected from ${initialDomain} to ${finalDomain}.`);
  if (response.truncated) limitations.push(`Only the first ${MAX_HTML_BYTES.toLocaleString()} bytes of the page were inspected.`);

  const pageText = stripHtml(html);
  const companyNameMatch = html ? checkCompanyName(company, pageText) : "not_checked";
  if (companyNameMatch === "match") {
    evidence.push("The company name appears in the retrieved website text; this does not verify company ownership.");
  } else if (companyNameMatch === "no_match") {
    evidence.push("The claimed company name was not found in the retrieved website text.");
  } else {
    limitations.push("The website did not return readable HTML for company-name comparison.");
  }

  const recruiterDomain = emailDomain(recruiterEmail);
  const recruiterDomainMatch = !recruiterEmail
    ? "not_provided"
    : domainsMatch(recruiterDomain, finalDomain)
      ? "match"
      : "mismatch";
  if (recruiterDomainMatch === "match") {
    evidence.push("Recruiter email domain matches the final website domain; this does not confirm the recruiter works for the company.");
  } else if (recruiterDomainMatch === "mismatch") {
    evidence.push(`Recruiter email domain (${recruiterDomain}) differs from website domain (${finalDomain}).`);
  }

  if (webRisk.status === "clear") {
    limitations.push("A clear threat-list result means no current match was found; it does not prove the offer or website is legitimate.");
  }
  if (!response.status || response.status >= 400) limitations.push("The website returned a non-success HTTP status.");
  if (redirects.length) limitations.push("A redirect is not inherently malicious; review the destination.");

  const status: WebsiteCheck["status"] =
    webRisk.status === "threat" ||
    response.status >= 400 ||
    companyNameMatch === "no_match" ||
    recruiterDomainMatch === "mismatch"
      ? "warning"
      : "passed";

  return {
    status,
    requestedUrl,
    finalUrl: currentUrl.toString(),
    httpStatus: response.status,
    https: currentUrl.protocol === "https:",
    redirects,
    domain: finalDomain,
    companyNameMatch,
    recruiterDomainMatch,
    evidence,
    limitations,
    webRisk,
  };
}
