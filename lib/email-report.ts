import { readFile } from "node:fs/promises";
import path from "node:path";
import { createReportPdf } from "@/lib/report-pdf";
import type { AnalysisReport } from "@/lib/types";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

async function sendBrandedEmail({
  to,
  subject,
  html,
  text,
  attachments = [],
  idempotencyKey,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<Record<string, string>>;
  idempotencyKey?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("EMAIL_NOT_CONFIGURED");

  const logo = await readFile(path.join(process.cwd(), "public", "logo.png"));
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
      attachments: [
        { filename: "internshield-logo.png", content: logo.toString("base64"), content_type: "image/png", content_id: "internshield-logo" },
        ...attachments,
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const providerReply = await response.json().catch(() => null) as { message?: string; name?: string } | null;
    const providerMessage = providerReply?.message?.slice(0, 240) || "The email service rejected the request.";
    console.error("Email provider rejected delivery:", response.status, providerMessage);
    throw new Error(`EMAIL_DELIVERY_FAILED:${response.status}:${providerMessage}`);
  }
}

function emailFrame(content: string) {
  return `<div style="margin:0;background:#f2f1e9;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#20251f"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background:#fbfaf5;border:1px solid #dedfd5"><tr><td style="padding:22px 30px;background:#141b16;border-bottom:4px solid #789064"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="cid:internshield-logo" width="48" height="48" alt="InternShield AI" style="display:block;width:48px;height:48px;object-fit:contain"></td><td style="padding-left:12px;vertical-align:middle"><div style="color:#f1f0e9;font-size:16px;font-weight:700;letter-spacing:-.2px">InternShield AI</div><div style="margin-top:4px;color:#a4aca3;font-size:10px;letter-spacing:1.5px;text-transform:uppercase">A ByteSentinels project</div></td></tr></table></td></tr><tr><td style="padding:34px 30px 30px">${content}</td></tr><tr><td style="padding:18px 30px;border-top:1px solid #dedfd5;color:#687168;font-size:11px;line-height:1.7">InternShield AI helps students review internship offers. Screening information is not proof of fraud or legitimacy. Verify important claims independently.</td></tr></table></div>`;
}

export async function sendWelcomeEmail(to: string, displayName: string | undefined, userId: string) {
  const name = displayName?.trim() ? escapeHtml(displayName.trim()) : "there";
  const html = emailFrame(`<p style="margin:0 0 12px;color:#607a50;font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase">EMAIL CONFIRMED · ACCOUNT READY</p><h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.15;font-weight:500;color:#20251f">Welcome to InternShield, ${name}.</h1><p style="margin:0 0 20px;color:#50594f;font-size:15px;line-height:1.8">Your email is confirmed and your account is ready. You can now review internship offers, see the warning signs we found, and keep a private record of your reports.</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;background:#e9e9df;border-left:3px solid #789064"><tr><td style="padding:16px 18px"><div style="margin-bottom:6px;color:#344332;font-size:13px;font-weight:700">A careful first step</div><div style="color:#596356;font-size:13px;line-height:1.7">Use each result as a prompt to verify the employer independently. A score alone cannot prove an offer is real or fraudulent.</div></td></tr></table><p style="margin:0;color:#687168;font-size:13px;line-height:1.7">Thanks for joining us,<br><strong style="color:#20251f">The InternShield team</strong></p>`);

  await sendBrandedEmail({
    to,
    subject: "Welcome to InternShield AI — your account is confirmed",
    html,
    text: `Welcome to InternShield, ${displayName?.trim() || "there"}. Your email is confirmed and your account is ready. Review internship offers, understand warning signs, and save private reports. Always verify important claims independently.`,
    idempotencyKey: `welcome-${userId}`,
  });
}

export async function sendReportEmail(report: AnalysisReport, to: string) {
  const pdf = await createReportPdf(report);
  const company = report.internship.company || "Internship";
  const safeCompany = escapeHtml(company);
  const filename = `internshield-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "report"}.pdf`;
  const html = emailFrame(`<p style="margin:0 0 12px;color:#607a50;font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase">YOUR OPPORTUNITY REVIEW</p><h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:500;color:#20251f">Your report is ready.</h1><p style="margin:0 0 20px;color:#50594f;font-size:15px;line-height:1.8">The PDF for <strong>${safeCompany}</strong> is attached. Open InternShield to review the findings and suggested next steps.</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;background:#e9e9df;border-left:3px solid #789064"><tr><td style="padding:16px 18px;color:#596356;font-size:13px;line-height:1.7">A screening result is informational. Independently verify important claims before making a decision.</td></tr></table>`);

  await sendBrandedEmail({
    to,
    subject: `Your InternShield review: ${company}`,
    html,
    text: `Your internship report for ${company} is attached as a PDF. A screening result is informational; verify important claims independently.`,
    attachments: [{ filename, content: Buffer.from(pdf).toString("base64") }],
  });
}

export function reportEmailFailureMessage(error: unknown) {
  if (!(error instanceof Error)) return "The email service could not send the report. Try again later.";
  if (error.message === "EMAIL_NOT_CONFIGURED") return "Email delivery is not set up yet. Add RESEND_API_KEY and a verified RESEND_FROM_EMAIL to the server environment.";
  if (error.message.startsWith("EMAIL_DELIVERY_FAILED:")) {
    const [, status, ...details] = error.message.split(":");
    const detail = details.join(":");
    if (/only send testing emails|verify a domain|testing emails to your own/i.test(detail)) {
      return "Resend is still in test mode and only allows email to its account address. Verify a domain in Resend → Domains, then set RESEND_FROM_EMAIL to an address on that verified domain. The signed-in InternShield account can be different; this limit comes from Resend.";
    }
    return `The email provider rejected this send (${status}). ${detail} Check that your sender address is verified and the API key is active.`;
  }
  return "The email service could not send the report. Try again later.";
}
