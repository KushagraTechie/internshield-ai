import { NextResponse } from "next/server";
import { saveAnalysisReport } from "@/lib/db";
import { authenticateFirebaseRequest } from "@/lib/firebase-server-auth";
import { reportEmailFailureMessage, sendReportEmail } from "@/lib/email-report";
import { inspectWebsite } from "@/lib/public-website";
import type { Finding, WebsiteCheck } from "@/lib/types";

type WarningSignal =
  | "payment"
  | "guarantee"
  | "pressure"
  | "personal"
  | "communication";

type AnalyzeRequest = {
  company?: string;
  title?: string;
  description?: string;
  recruiterEmail?: string;
  applicationUrl?: string;
  asksForPayment?: boolean;
  warningSignals?: string[];
  emailReport?: boolean;
};

function includesAny(text: string, phrases: string[]) {
  return phrases.filter((phrase) => text.includes(phrase));
}

function emailDomain(email: string) {
  const at = email.lastIndexOf("@");
  return at > 0 ? email.slice(at + 1).toLowerCase().replace(/^www\./, "") : "";
}

function addFinding(
  findings: Finding[],
  title: string,
  severity: Finding["severity"],
  points: number,
  description: string,
  evidence: string[]
) {
  if (evidence.length === 0) return;

  const existing = findings.find((finding) => finding.title === title);
  if (existing) {
    existing.evidence = [...new Set([...existing.evidence, ...evidence])];
    return;
  }

  findings.push({
    title,
    severity,
    points,
    description,
    evidence: [...new Set(evidence)],
  });
}

export async function POST(request: Request) {
  try {
    const authentication = await authenticateFirebaseRequest(request);
    if (!authentication.ok) {
      return NextResponse.json(
        { success: false, message: authentication.message },
        { status: authentication.status }
      );
    }

    if (!authentication.user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verify your email address before analyzing an internship. Check your inbox or resend the verification email from your account page.",
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as AnalyzeRequest;
    const company = body.company?.trim() ?? "";
    const title = body.title?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const recruiterEmail = body.recruiterEmail?.trim() ?? "";
    const applicationUrl = body.applicationUrl?.trim() ?? "";
    const warningSignals = (body.warningSignals ?? []) as WarningSignal[];

    if (!company || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Company, internship role, and description are required.",
        },
        { status: 400 }
      );
    }

    const text = `${company} ${title} ${description}`.toLowerCase();
    const findings: Finding[] = [];

    // 1. Payment / fee scam indicators
    const paymentEvidence = includesAny(text, [
      "registration fee", "application fee", "training fee", "security deposit",
      "pay to secure", "payment to secure", "processing fee", "pay immediately",
      "pay now", "pay ₹", "pay rs", "pay inr",
    ]);
    if (body.asksForPayment || warningSignals.includes("payment")) {
      paymentEvidence.push("Payment/fee warning selected by user");
    }
    addFinding(
      findings,
      "Payment or fee demand",
      "high",
      40,
      "Legitimate internships generally should not require candidates to pay fees to obtain selection or employment.",
      paymentEvidence
    );

    // 2. Guaranteed selection / placement
    const guaranteeEvidence = includesAny(text, [
      "guaranteed selection", "guaranteed placement", "100% placement",
      "job guaranteed", "internship guaranteed", "without interview",
      "direct selection guaranteed",
    ]);
    if (warningSignals.includes("guarantee")) {
      guaranteeEvidence.push("Guarantee warning selected by user");
    }
    addFinding(
      findings,
      "Unrealistic guarantee",
      "high",
      25,
      "Promises of guaranteed selection or placement without a meaningful evaluation can be a fraud indicator.",
      guaranteeEvidence
    );

    // 3. Pressure / urgency
    const pressureEvidence = includesAny(text, [
      "limited positions", "limited seats", "act now", "urgent", "immediately",
      "within 24 hours", "last date today", "pay today", "hurry", "offer expires",
    ]);
    if (warningSignals.includes("pressure")) {
      pressureEvidence.push("Urgency/pressure warning selected by user");
    }
    addFinding(
      findings,
      "High-pressure recruitment",
      "medium",
      15,
      "Artificial urgency may be used to pressure candidates into making quick decisions or payments.",
      pressureEvidence
    );

    // 4. Government approval / affiliation claims
    const approvalEvidence = includesAny(text, [
      "government approved", "govt approved", "ministry approved",
      "approved by ministry", "mca approved", "aicte approved",
      "government certified", "official government internship",
    ]);
    const contradictionEvidence = includesAny(text, [
      "claim is false", "not approved", "not affiliated", "approval not issued",
      "fake approval", "false claim",
    ]);
    if (approvalEvidence.length > 0) {
      addFinding(
        findings,
        "Government approval claim",
        contradictionEvidence.length > 0 ? "high" : "medium",
        contradictionEvidence.length > 0 ? 30 : 10,
        contradictionEvidence.length > 0
          ? "The description contains an approval claim alongside wording that contradicts it."
          : "A government approval claim was detected. This platform does not independently verify official approval.",
        [...approvalEvidence, ...contradictionEvidence]
      );
    }

    // 5. Sensitive personal information
    const personalEvidence = includesAny(text, [
      "share otp", "send otp", "bank password", "upi pin", "card cvv",
      "internet banking password", "aadhaar otp", "password",
    ]);
    if (warningSignals.includes("personal")) {
      personalEvidence.push("Sensitive-information warning selected by user");
    }
    addFinding(
      findings,
      "Sensitive information request",
      "high",
      35,
      "Requests for passwords, OTPs, PINs, or banking credentials are unsafe and should not be fulfilled.",
      personalEvidence
    );

    // 6. Unusual communication channel
    const communicationEvidence = includesAny(text, [
      "whatsapp only", "telegram only", "contact on whatsapp",
      "message on telegram", " whatsapp ", " telegram ",
    ]);
    if (warningSignals.includes("communication")) {
      communicationEvidence.push("Unusual-communication warning selected by user");
    }
    addFinding(
      findings,
      "Unusual recruitment communication",
      "medium",
      10,
      "Recruitment conducted only through informal messaging channels should be independently verified.",
      communicationEvidence
    );

    // 7. Recruiter email format / generic email provider
    if (recruiterEmail) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recruiterEmail);
      if (!emailValid) {
        addFinding(
          findings,
          "Invalid recruiter email format",
          "medium",
          15,
          "The supplied recruiter email does not appear to have a valid email format.",
          [recruiterEmail]
        );
      } else {
        const domain = emailDomain(recruiterEmail);
        const genericDomains = [
          "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
          "proton.me", "protonmail.com",
        ];
        if (genericDomains.includes(domain)) {
          addFinding(
            findings,
            "Generic recruiter email domain",
            "low",
            8,
            "A free email provider is being used instead of a company domain. This is not proof of fraud, but verify the recruiter independently.",
            [recruiterEmail]
          );
        }
      }
    }

    // 8. Live website and domain inspection (public HTTP/HTTPS URLs only).
    let websiteCheck: WebsiteCheck | null = null;
    if (applicationUrl) {
      try {
        websiteCheck = await inspectWebsite(applicationUrl, company, recruiterEmail);

        if (websiteCheck.webRisk.status === "threat") {
          addFinding(
            findings,
            "Website appears on a threat list",
            "high",
            40,
            "Google Web Risk reported this URL for a potential security threat. Do not enter personal or payment information unless the destination is independently confirmed.",
            websiteCheck.webRisk.threatTypes
          );
        }

        if (!websiteCheck.https) {
          addFinding(
            findings,
            "Application website does not use HTTPS",
            "medium",
            10,
            "The final application website does not use HTTPS. Avoid entering personal information until it is independently verified.",
            [websiteCheck.finalUrl ?? applicationUrl]
          );
        }

        if (websiteCheck.companyNameMatch === "no_match") {
          addFinding(
            findings,
            "Company name not found on website",
            "medium",
            12,
            "The claimed company name was not found in the retrieved website text. This can indicate a mismatch, but may also occur on application portals or minimal websites.",
            [websiteCheck.finalUrl ?? applicationUrl]
          );
        }

        if (websiteCheck.recruiterDomainMatch === "mismatch") {
          addFinding(
            findings,
            "Recruiter and website domains differ",
            "medium",
            10,
            "The recruiter's email domain differs from the website domain. This is a verification warning, not proof of fraud.",
            [recruiterEmail, websiteCheck.domain]
          );
        }

        if (websiteCheck.httpStatus && websiteCheck.httpStatus >= 400) {
          addFinding(
            findings,
            "Company website returned an error",
            "low",
            5,
            "The submitted website returned an HTTP error during this check. The site may be temporarily unavailable.",
            [`HTTP ${websiteCheck.httpStatus}`, websiteCheck.finalUrl ?? applicationUrl]
          );
        }
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : "Website verification could not be completed.";
        websiteCheck = {
          status: "unavailable",
          requestedUrl: applicationUrl,
          https: applicationUrl.startsWith("https://"),
          redirects: [],
          domain: "",
          companyNameMatch: "not_checked",
          recruiterDomainMatch: recruiterEmail ? "not_checked" : "not_provided",
          evidence: [],
          limitations: [reason],
          webRisk: {
            status: "unavailable",
            source: "Google Web Risk",
            threatTypes: [],
          },
        };
        addFinding(
          findings,
          "Website could not be verified",
          "low",
          3,
          "The website could not be safely reached or inspected. This is not proof of fraud; verify it manually using an independently found official source.",
          [reason]
        );
      }
    }

    const riskScore = Math.min(
      100,
      findings.reduce((total, finding) => total + finding.points, 0)
    );
    const riskLevel: "low" | "medium" | "high" =
      riskScore >= 50 ? "high" : riskScore >= 20 ? "medium" : "low";

    const recommendedAction =
      riskLevel === "high"
        ? "Do not pay or share sensitive information. Verify the company and recruiter through independently found official channels."
        : riskLevel === "medium"
          ? "Proceed cautiously. Verify the recruiter, company domain, and internship details before sharing information."
          : "No major warning indicators were detected by these checks. A low score is not proof that the internship or company is genuine.";

    const analyzedAt = new Date();
    const report = {
      internship: {
        company,
        title,
        description,
        recruiterEmail,
        applicationUrl,
      },
      riskScore,
      riskLevel,
      findings,
      websiteCheck,
      recommendedAction,
      checksPerformed: [
        "Description-based scam phrase checks",
        "Payment demand indicators",
        "Selection and placement guarantee indicators",
        "Urgency and pressure indicators",
        "Government approval claim wording",
        "Sensitive information request indicators",
        "Recruiter email format and generic-domain check",
        "Live public website accessibility check",
        "HTTP status and redirect inspection",
        "HTTPS check on the final website URL",
        "Website text comparison against the claimed company name",
        "Recruiter email domain comparison against the website domain",
        "Private and local network URL blocking for SSRF protection",
      ],
      limitations: [
        "This is a rule-based risk assessment, not a trained machine-learning classifier.",
        "Website text matching is a basic consistency signal and does not prove company ownership or legitimacy.",
        "Company registry status and whether the specific internship is posted on an official careers page are not verified.",
        "The website scan reads a limited amount of public HTML and does not execute JavaScript or inspect password-protected pages.",
        "A low score or successful website check does not guarantee that an internship is genuine.",
      ],
      reportChecks: websiteCheck ? [
        { title: "Public website access and redirects", status: websiteCheck.status === "unavailable" ? "not_checked" as const : websiteCheck.httpStatus && websiteCheck.httpStatus >= 400 ? "warning" as const : "passed" as const },
        { title: "Google Web Risk threat-list lookup", status: websiteCheck.webRisk.status === "threat" ? "warning" as const : websiteCheck.webRisk.status === "clear" ? "passed" as const : "not_checked" as const },
        { title: "Company name on website text", status: websiteCheck.companyNameMatch === "match" ? "passed" as const : websiteCheck.companyNameMatch === "no_match" ? "warning" as const : "not_checked" as const },
        { title: "Recruiter and website domain comparison", status: websiteCheck.recruiterDomainMatch === "match" ? "passed" as const : websiteCheck.recruiterDomainMatch === "mismatch" ? "warning" as const : "not_checked" as const },
      ] : [],
      analyzedAt,
    };

    // Save each report with the verified Firebase identity.
    let reportId: string | undefined;
    let persistenceStatus: "saved" | "unavailable" = "saved";

    try {
      reportId = crypto.randomUUID();
      await saveAnalysisReport(authentication.user, reportId, report);
    } catch (dbError) {
      persistenceStatus = "unavailable";
      console.error("Neon report save failed:", dbError);
    }

    let emailStatus:
      | "sent"
      | "not_configured"
      | "failed"
      | "not_requested" = "not_requested";

    if (body.emailReport && reportId && persistenceStatus === "saved") {
      if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
        emailStatus = "not_configured";
      } else {
        try {
          await sendReportEmail(report, authentication.user.email!);
          emailStatus = "sent";
        } catch (emailError) {
          emailStatus = "failed";
          console.error("Automatic report email failed:", reportEmailFailureMessage(emailError));
        }
      }
    }

    const message =
      persistenceStatus !== "saved"
        ? "Analysis completed, but the report could not be saved."
        : "Analysis complete and saved. Your report is ready to download.";

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        ...(reportId ? { reportId } : {}),
        persistenceStatus,
        emailStatus,
      },
      message,
    });
  } catch (error) {
    console.error("Internship analysis failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to analyze this internship. Please try again.",
      },
      { status: 500 }
    );
  }
}
