export type RiskLevel = "low" | "medium" | "high";
export type Severity = RiskLevel;

export type Finding = {
  title: string;
  severity: Severity;
  points: number;
  description: string;
  evidence: string[];
};

export type ReportCheck = {
  title: string;
  status: "warning" | "passed" | "not_checked";
};

export type WebRiskCheck = {
  status: "threat" | "clear" | "not_configured" | "quota_reached" | "unavailable";
  source: "Google Web Risk";
  threatTypes: string[];
  checkedAt?: string;
};

export type WebsiteCheck = {
  status: "passed" | "warning" | "failed" | "unavailable";
  requestedUrl: string;
  finalUrl?: string;
  httpStatus?: number;
  https: boolean;
  redirects: string[];
  domain: string;
  companyNameMatch: "match" | "no_match" | "not_checked";
  recruiterDomainMatch: "match" | "mismatch" | "not_provided" | "not_checked";
  evidence: string[];
  limitations: string[];
  webRisk: WebRiskCheck;
};

export type InternshipDetails = {
  company: string;
  title: string;
  description: string;
  recruiterEmail: string;
  applicationUrl: string;
};

export type AnalysisReport = {
  internship: InternshipDetails;
  riskScore: number;
  riskLevel: RiskLevel;
  findings: Finding[];
  recommendedAction: string;
  checksPerformed: string[];
  reportChecks?: ReportCheck[];
  websiteCheck?: WebsiteCheck | null;
  limitations: string[];
  analyzedAt: string | Date;
  reportId?: string;
  persistenceStatus?: "saved" | "unavailable";
  emailStatus?: "sent" | "not_configured" | "failed" | "not_requested";
};

export type AnalyzeResponse = {
  success: boolean;
  report?: AnalysisReport;
  message: string;
  error?: string;
};

