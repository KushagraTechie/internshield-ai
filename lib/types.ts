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

