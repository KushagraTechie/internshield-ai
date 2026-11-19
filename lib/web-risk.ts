import { reserveWebRiskLookup } from "@/lib/db";
import type { WebRiskCheck } from "@/lib/types";

const WEB_RISK_SOURCE = "Google Web Risk" as const;
const WEB_RISK_TIMEOUT_MS = 5_000;

export async function checkWebRiskUrl(url: string): Promise<WebRiskCheck> {
  const apiKey = process.env.WEB_RISK_API_KEY;
  if (!apiKey) {
    return {
      status: "not_configured",
      source: WEB_RISK_SOURCE,
      threatTypes: [],
    };
  }

  try {
    const reserved = await reserveWebRiskLookup();
    if (!reserved) {
      return {
        status: "quota_reached",
        source: WEB_RISK_SOURCE,
        threatTypes: [],
      };
    }
  } catch (error) {
    console.error("Web Risk budget reservation failed:", error);
    return {
      status: "unavailable",
      source: WEB_RISK_SOURCE,
      threatTypes: [],
    };
  }

  const endpoint = new URL("https://webrisk.googleapis.com/v1/uris:search");
  endpoint.searchParams.append("threatTypes", "SOCIAL_ENGINEERING");
  endpoint.searchParams.append("threatTypes", "MALWARE");
  endpoint.searchParams.set("uri", url);
  endpoint.searchParams.set("key", apiKey);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(WEB_RISK_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error("Web Risk lookup returned HTTP status:", response.status);
      return {
        status: "unavailable",
        source: WEB_RISK_SOURCE,
        threatTypes: [],
        checkedAt: new Date().toISOString(),
      };
    }

    const result = await response.json() as {
      threat?: { threatTypes?: string[] };
    };
    const threatTypes = result.threat?.threatTypes ?? [];
    return {
      status: threatTypes.length ? "threat" : "clear",
      source: WEB_RISK_SOURCE,
      threatTypes,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Web Risk lookup failed:", error);
    return {
      status: "unavailable",
      source: WEB_RISK_SOURCE,
      threatTypes: [],
      checkedAt: new Date().toISOString(),
    };
  }
}
