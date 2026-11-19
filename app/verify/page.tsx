
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { reload } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import ReportActions from "@/app/components/report-actions";
import { useWorkspaceTheme } from "@/app/components/theme-provider";
import type {
  AnalysisReport,
  AnalyzeResponse,
  RiskLevel,
  Severity,
} from "@/lib/types";

const warningOptions = [
  {
    id: "payment",
    label: "Upfront payment requested",
    detail: "Registration fees, deposits, or payment to secure an offer.",
  },
  {
    id: "guarantee",
    label: "Unrealistic salary or guaranteed selection",
    detail: "Promises that appear unusually generous or guaranteed.",
  },
  {
    id: "pressure",
    label: "Pressure to act immediately",
    detail: "Urgent demands that discourage careful verification.",
  },
  {
    id: "personal",
    label: "Sensitive information requested too early",
    detail: "Requests for banking details, passwords, or unnecessary documents.",
  },
  {
    id: "communication",
    label: "Unusual recruiter communication",
    detail: "Unverifiable identity, suspicious contact details, or inconsistent claims.",
  },
];

function severityStyles(severity: Severity) {
  switch (severity) {
    case "high":
      return {
        label: "HIGH",
        badge: "border-rose-500/20 bg-rose-500/10 text-rose-500",
      };
    case "medium":
      return {
        label: "MEDIUM",
        badge: "border-amber-500/20 bg-amber-500/10 text-amber-500",
      };
    default:
      return {
        label: "LOW",
        badge: "border-sky-500/20 bg-sky-500/10 text-sky-500",
      };
  }
}

function riskStyles(level: RiskLevel) {
  switch (level) {
    case "high":
      return {
        label: "HIGH RISK",
        color: "text-rose-500",
        bar: "bg-rose-500",
      };
    case "medium":
      return {
        label: "MEDIUM RISK",
        color: "text-amber-500",
        bar: "bg-amber-500",
      };
    default:
      return {
        label: "LOW RISK",
        color: "text-emerald-500",
        bar: "bg-emerald-500",
      };
  }
}

function recommendedAction(severity: Severity) {
  if (severity === "high") {
    return "Pause the application process. Verify this claim directly through an independently located official source before sharing sensitive information or making payments.";
  }

  if (severity === "medium") {
    return "Independently verify the recruiter, organisation, and offer details before proceeding.";
  }

  return "Review this warning and verify the relevant details before making a decision.";
}

export default function VerifyPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]);
  const [emailReport, setEmailReport] = useState(true);
  const { theme: mode, toggleTheme } = useWorkspaceTheme();
  const lightMode = mode === "light";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [analysisNotice, setAnalysisNotice] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login?next=/verify");
        return;
      }
      setAuthReady(true);
    });
  }, [router]);

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B16] px-6 text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Checking your account…</p>
        </div>
      </main>
    );
  }

  const theme = lightMode
    ? {
        page: "bg-[#f2f1e9] text-[#20251f]",
        nav: "border-[#d8d9cf] bg-[#f2f1e9]",
        card: "border-[#dedfd5] bg-[#fbfaf5]",
        muted: "text-[#687168]",
        input: "border-[#d8d9cf] bg-[#fbfaf5] text-[#20251f]",
        soft: "bg-[#e9e9df]",
        footer: "border-[#d8d9cf]",
        divider: "border-[#d8d9cf]",
        panel: "bg-[#f4f3ec]",
      }
    : {
        page: "bg-[#101612] text-[#f1f0e9]",
        nav: "border-[#303a34] bg-[#141b16]",
        card: "border-[#303a34] bg-[#171e1a]",
        muted: "text-[#a4aca3]",
        input: "border-[#303a34] bg-[#141b16] text-white",
        soft: "bg-[#141b16]",
        footer: "border-[#303a34]",
        divider: "border-[#303a34]",
        panel: "bg-[#202820]",
      };

  const inputClass = `w-full border ${theme.input} px-4 py-3.5 outline-none transition placeholder:text-slate-500 focus:border-[#789064] focus:ring-1 focus:ring-[#789064]/30`;

  function clearPreviousAnalysis() {
    setAnalysis(null);
    setError("");
  }

  function toggleWarning(id: string) {
    setSelectedWarnings((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
    clearPreviousAnalysis();
  }

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    if (!company.trim() || !role.trim() || !description.trim()) {
      setError("Please enter the company name, internship role, and description.");
      return;
    }

    if (
      company.trim().length > 200 ||
      role.trim().length > 200 ||
      description.trim().length > 5000 ||
      url.trim().length > 2048
    ) {
      setError("One or more fields exceed the allowed length.");
      return;
    }

    if (url.trim()) {
      try {
        const parsedUrl = new URL(url.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          setError("Please enter a valid HTTP or HTTPS application URL.");
          return;
        }
      } catch {
        setError("Please enter a valid application URL, or leave it blank.");
        return;
      }
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.replace("/login?next=/verify");
        return;
      }
      await reload(currentUser);
      if (!auth.currentUser?.emailVerified) {
        router.replace("/verify-email");
        return;
      }
      const idToken = await currentUser.getIdToken();
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          company: company.trim(),
          title: role.trim(),
          description: description.trim(),
          applicationUrl: url.trim(),
          asksForPayment: selectedWarnings.includes("payment"),
          warningSignals: selectedWarnings,
          emailReport,
        }),
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !data.success || !data.report) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to analyze this internship. Please try again."
        );
      }

      setAnalysis(data.report);
      setAnalysisNotice(data.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while contacting the analysis API."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentRisk = analysis ? riskStyles(analysis.riskLevel) : null;

  return (
    <main className={`workspace-page relative min-h-screen overflow-hidden ${theme.page}`}>

      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${theme.nav}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="InternShield logo"
              width={48}
              height={48}
              priority
              className="h-11 w-11 object-contain"
            />
            <span>
              <span className="block font-bold">
                InternShield <span className="text-violet-500">AI</span>
              </span>
              <span className={`block text-xs ${theme.muted}`}>
                by ByteSentinels
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/contact"
              className={`hidden text-sm transition hover:text-violet-500 sm:inline ${theme.muted}`}
            >
              Contact
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={lightMode ? "Switch to dark mode" : "Switch to light mode"}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                lightMode
                  ? "border-violet-200 bg-white"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              {lightMode ? "☾" : "☼"}
            </button>

            <Link href="/dashboard" className={`hidden rounded-xl border px-3 py-2.5 text-sm font-semibold sm:inline-flex ${lightMode ? "border-violet-950/10" : "border-white/10"}`}>Workspace</Link>
            <Link href="/history" className={`hidden rounded-xl border px-3 py-2.5 text-sm font-semibold md:inline-flex ${lightMode ? "border-violet-950/10" : "border-white/10"}`}>Reports</Link>
            <Link href="/settings" aria-label="Account settings" className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${lightMode ? "border-violet-950/10" : "border-white/10"}`}>Account</Link>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 border border-[#789064]/30 bg-[#789064]/10 px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-[#607a50]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            INTERNSHIP REVIEW WORKSPACE
          </div>

          <h1 className="mt-6 font-serif text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
            Look closer.
            <span className="block text-[#607a50]">
              Decide smarter.
            </span>
          </h1>

          <p className={`mt-5 max-w-2xl text-base leading-8 ${theme.muted}`}>
            Enter the details of an internship opportunity, flag anything
            concerning, and review the available risk signals before making a
            decision.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className={`rounded-3xl border p-5 sm:p-8 ${theme.card}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-violet-500">
                  STEP 01
                </p>
                <h2 className="mt-2 text-xl font-bold">Opportunity details</h2>
                <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                  Add the information supplied by the employer.
                </p>
              </div>
              <span className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-500">
                Review form
              </span>
            </div>

            <form onSubmit={handleAnalyze} className="mt-7 space-y-5">
              <div>
                <label htmlFor="company" className="mb-2 block text-sm font-medium">
                  Company or organization *
                </label>
                <input
                  id="company"
                  value={company}
                  maxLength={200}
                  onChange={(event) => {
                    setCompany(event.target.value);
                    clearPreviousAnalysis();
                  }}
                  placeholder="e.g. Example Technologies"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="mb-2 block text-sm font-medium">
                  Internship role *
                </label>
                <input
                  id="role"
                  value={role}
                  maxLength={200}
                  onChange={(event) => {
                    setRole(event.target.value);
                    clearPreviousAnalysis();
                  }}
                  placeholder="e.g. Frontend Developer Intern"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="url" className="mb-2 block text-sm font-medium">
                  Application or company website
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  maxLength={2048}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    clearPreviousAnalysis();
                  }}
                  placeholder="https://example.com/careers"
                  className={inputClass}
                />
                <p className={`mt-2 text-xs ${theme.muted}`}>
                  Optional. We check public access, redirects, page text, and—when configured—Google Web Risk threat lists. This cannot prove an offer is genuine.
                </p>
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium">
                  Internship description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  maxLength={5000}
                  rows={5}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    clearPreviousAnalysis();
                  }}
                  placeholder="Paste the internship description, responsibilities, compensation details, and recruiter requests..."
                  className={`${inputClass} resize-y`}
                  required
                />
                <p className={`mt-2 text-right text-xs ${theme.muted}`}>
                  {description.length}/5000 characters
                </p>
              </div>

              <div className={`rounded-2xl border p-5 ${theme.soft}`}>
                <p className="text-xs font-bold tracking-[0.15em] text-violet-500">
                  STEP 02
                </p>
                <h3 className="mt-2 font-bold">Warning-sign checklist</h3>
                <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                  Select warning signs you have observed. These selections are
                  sent to the backend along with the description.
                </p>

                <div className="mt-5 space-y-3">
                  {warningOptions.map((option) => {
                    const checked = selectedWarnings.includes(option.id);

                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                          checked
                            ? "border-violet-500/50 bg-violet-500/10"
                            : lightMode
                              ? "border-violet-950/10 bg-white"
                              : "border-white/10 bg-[#080B16]/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleWarning(option.id)}
                          className="mt-1 h-4 w-4 accent-violet-600"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {option.label}
                          </span>
                          <span className={`mt-1 block text-xs leading-5 ${theme.muted}`}>
                            {option.detail}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-500"
                >
                  {error}
                </div>
              )}

              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${theme.divider} ${theme.soft}`}>
                <input type="checkbox" checked={emailReport} onChange={(event) => setEmailReport(event.target.checked)} className="mt-1 h-4 w-4 accent-violet-600" />
                <span><span className="block text-sm font-semibold">Email me a PDF copy</span><span className={`mt-1 block text-xs leading-5 ${theme.muted}`}>We’ll send it to your verified account email after the report is saved. You can turn this off any time.</span></span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 bg-[#3b5b43] px-5 py-4 font-semibold text-white transition hover:bg-[#2d4935] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing internship...
                  </>
                ) : (
                  <>Analyze internship <span>→</span></>
                )}
              </button>

              <p className={`text-center text-xs leading-5 ${theme.muted}`}>
                We combine rule-based checks with a limited public website scan. The report cannot confirm company registration or prove that a specific internship offer is real.
              </p>
            </form>
          </section>

          <aside className="space-y-6">
            <section className={`rounded-3xl border p-5 sm:p-6 ${theme.card}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-violet-500">
                    API ASSESSMENT
                  </p>
                  <h2 className="mt-2 text-xl font-bold">Risk assessment</h2>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-500">
                  ◈
                </span>
              </div>

              {analysis && currentRisk ? (
                <>
                  {analysisNotice && (
                    <p
                      role="status"
                      className={`mb-4 rounded-xl border px-4 py-3 text-xs leading-5 ${analysis?.persistenceStatus === "unavailable" ? "border-amber-500/25 bg-amber-500/10 text-amber-700" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700"}`}
                    >
                      {analysisNotice}
                    </p>
                  )}
                  <div className={`mt-6 rounded-2xl border p-4 ${theme.panel}`}>
                    <p className={`text-xs ${theme.muted}`}>
                      Backend risk assessment
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className={`font-bold ${currentRisk.color}`}>
                        {currentRisk.label}
                      </span>
                      <span className="text-2xl font-bold tabular-nums">
                        {analysis.riskScore}
                        <span className={`text-sm font-normal ${theme.muted}`}>
                          /100
                        </span>
                      </span>
                    </div>

                    <div className={`mt-4 h-2 overflow-hidden rounded-full ${lightMode ? "bg-slate-200" : "bg-white/10"}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${currentRisk.bar}`}
                        style={{
                          width: `${Math.min(100, Math.max(0, analysis.riskScore))}%`,
                        }}
                      />
                    </div>

                    <p className={`mt-4 text-xs leading-6 ${theme.muted}`}>
                      This score reflects warning signals detected by the
                      current rules. It is not a probability that the
                      internship is fraudulent.
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className={`flex items-start justify-between gap-4 border-b pb-4 ${theme.divider}`}>
                      <span className={`text-sm ${theme.muted}`}>Company</span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold">
                        {analysis.internship.company}
                      </span>
                    </div>

                    <div className={`flex items-start justify-between gap-4 border-b pb-4 ${theme.divider}`}>
                      <span className={`text-sm ${theme.muted}`}>Role</span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold">
                        {analysis.internship.title}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className={`text-sm ${theme.muted}`}>Description</span>
                      <span className="text-right text-sm font-semibold">Provided</span>
                    </div>
                  </div>

                  <div className={`mt-6 border-t pt-5 ${theme.divider}`}>
                    <h3 className="font-bold">Findings</h3>

                    {analysis.findings.length === 0 ? (
                      <p className={`mt-3 text-sm leading-6 ${theme.muted}`}>
                        No warning signals were detected by the current rules.
                        This does not prove that the internship is legitimate.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {analysis.findings.map((finding, index) => {
                          const severity = severityStyles(finding.severity);

                          return (
                            <article
                              key={`${finding.title}-${index}`}
                              className={`rounded-xl border p-4 ${theme.soft}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-sm font-semibold leading-6">
                                  {finding.title}
                                </h4>
                                <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${severity.badge}`}>
                                  {severity.label}
                                </span>
                              </div>

                              <p className={`mt-3 text-sm leading-6 ${theme.muted}`}>
                                {finding.description}
                              </p>

                              {finding.evidence?.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-xs font-bold uppercase tracking-wide text-violet-500">
                                    Evidence detected
                                  </p>
                                  <ul className="mt-2 space-y-2">
                                    {finding.evidence.map((item, evidenceIndex) => (
                                      <li
                                        key={`${finding.title}-evidence-${evidenceIndex}`}
                                        className={`break-words rounded-lg border px-3 py-2 text-xs leading-5 ${theme.card}`}
                                      >
                                        <span className="mr-2 text-violet-500">•</span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className={`mt-4 border-t pt-3 ${theme.divider}`}>
                                <p className="text-xs font-bold text-violet-500">
                                  Recommended action
                                </p>
                                <p className={`mt-2 text-xs leading-6 ${theme.muted}`}>
                                  {recommendedAction(finding.severity)}
                                </p>
                              </div>

                              <p className={`mt-3 text-[11px] ${theme.muted}`}>
                                Rule-based points: {finding.points}
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {analysis.websiteCheck && (
                    <div className={`mt-5 border-t pt-5 ${theme.divider}`}>
                      <h3 className="font-bold">Website and reputation check</h3>
                      <p className={`mt-2 break-all text-xs leading-5 ${theme.muted}`}>
                        {analysis.websiteCheck.finalUrl ?? analysis.websiteCheck.requestedUrl}
                        {analysis.websiteCheck.httpStatus ? ` · HTTP ${analysis.websiteCheck.httpStatus}` : ""}
                      </p>
                      <p className={`mt-2 text-xs leading-5 ${theme.muted}`}>
                        Google Web Risk: {analysis.websiteCheck.webRisk.status === "clear" ? "No current threat-list match" : analysis.websiteCheck.webRisk.status === "threat" ? `Potential threat (${analysis.websiteCheck.webRisk.threatTypes.join(", ")})` : analysis.websiteCheck.webRisk.status === "quota_reached" ? "Monthly app allowance reached" : analysis.websiteCheck.webRisk.status === "not_configured" ? "Not configured" : "Unavailable"}
                        {analysis.websiteCheck.webRisk.checkedAt ? ` · Checked ${new Date(analysis.websiteCheck.webRisk.checkedAt).toLocaleString()}` : ""}
                      </p>
                      <ul className={`mt-3 space-y-2 text-xs leading-5 ${theme.muted}`}>
                        {analysis.websiteCheck.evidence.map((item, index) => <li key={`website-evidence-${index}`}>• {item}</li>)}
                        {analysis.websiteCheck.limitations.map((item, index) => <li key={`website-limit-${index}`} className="text-amber-500">• {item}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className={`mt-6 border-t pt-5 ${theme.divider}`}>
                    <h3 className="font-bold">Checks performed</h3>
                    <ul className={`mt-3 space-y-2 text-xs leading-5 ${theme.muted}`}>
                      {analysis.checksPerformed.map((check, index) => (
                        <li key={`${check}-${index}`} className="flex gap-2">
                          <span className="text-violet-500">•</span>
                          <span>{check}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analysis.reportChecks && analysis.reportChecks.length > 0 && (
                    <div className={`mt-5 border-t pt-5 ${theme.divider}`}>
                      <h3 className="font-bold">Check results</h3>
                      <div className="mt-3 space-y-3">
                        {analysis.reportChecks.map((check, index) => (
                          <div key={`${check.title}-${index}`} className="flex items-start justify-between gap-3">
                            <span className={`text-xs leading-5 ${theme.muted}`}>
                              {check.title}
                            </span>
                            <span
                              className={`shrink-0 text-[10px] font-bold uppercase ${
                                check.status === "warning"
                                  ? "text-amber-500"
                                  : check.status === "passed"
                                    ? "text-emerald-500"
                                    : "text-slate-400"
                              }`}
                            >
                              {check.status === "not_checked" ? "Not checked" : check.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.limitations?.length > 0 && (
                    <div className={`mt-5 border-t pt-5 ${theme.divider}`}>
                      <h3 className="font-bold">Important limitations</h3>
                      <ul className={`mt-3 space-y-2 text-xs leading-6 ${theme.muted}`}>
                        {analysis.limitations.map((limitation, index) => (
                          <li key={`limitation-${index}`} className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className={`mt-5 text-[11px] ${theme.muted}`}>
                    Analyzed: {new Date(analysis.analyzedAt).toLocaleString()}
                  </p>

                  {analysis.reportId && analysis.persistenceStatus === "saved" && (
                    <div className="mt-5">
                      <ReportActions reportId={analysis.reportId} downloadOnly />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setAnalysis(null);
                      setError("");
                    }}
                    className="mt-5 w-full rounded-xl border border-violet-500/30 px-4 py-3 text-sm font-semibold text-violet-500 transition hover:bg-violet-500/10"
                  >
                    Clear assessment
                  </button>
                </>
              ) : (
                <div className={`mt-6 rounded-2xl border p-5 ${theme.soft}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-500">
                    ◈
                  </div>
                  <h3 className="mt-4 font-bold">
                    {loading ? "Analyzing opportunity..." : "Ready to analyze"}
                  </h3>
                  <p className={`mt-2 text-sm leading-7 ${theme.muted}`}>
                    {loading
                      ? "Your submission is being checked against the current backend rules."
                      : "Submit the internship details to receive a backend risk score, findings, matching evidence, and recommended next steps."}
                  </p>
                  {!loading && (
                    <ul className={`mt-4 space-y-2 text-xs leading-5 ${theme.muted}`}>
                      <li>• Payment and fee requests</li>
                      <li>• Government approval claims</li>
                      <li>• Guaranteed selection and urgency</li>
                      <li>• URL formatting and protocol</li>
                      <li>• Sensitive information requests</li>
                    </ul>
                  )}
                </div>
              )}
            </section>

            <section className={`rounded-3xl border p-6 ${
              lightMode
                ? "border-amber-200 bg-amber-50"
                : "border-amber-400/15 bg-amber-400/[0.04]"
            }`}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-500">
                  !
                </span>
                <h3 className="font-bold">Before you proceed</h3>
              </div>
              <ul className={`mt-4 space-y-3 text-sm leading-6 ${theme.muted}`}>
                <li>• Never pay to secure an internship without independent verification.</li>
                <li>• Never share passwords, OTPs, or UPI PINs with a recruiter.</li>
                <li>• Verify the employer using independently located official sources.</li>
                <li>• A low score is not proof of legitimacy, and a high score is not proof of fraud.</li>
              </ul>
            </section>

            <Link
              href="/contact"
              className={`flex items-center justify-between gap-4 rounded-2xl border p-5 transition hover:border-violet-500/40 ${theme.card}`}
            >
              <span>
                <span className="block font-semibold">Have feedback?</span>
                <span className={`mt-1 block text-sm ${theme.muted}`}>
                  Help improve the review experience.
                </span>
              </span>
              <span className="text-xl text-violet-500">↗</span>
            </Link>
          </aside>
        </div>

        <footer className={`mt-12 flex flex-col gap-4 border-t py-7 text-xs ${theme.footer} ${theme.muted} sm:flex-row sm:items-center sm:justify-between`}>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span>
              <span className="font-semibold">InternShield AI</span> by ByteSentinels
            </span>
          </Link>
          <div className="flex flex-wrap gap-5">
            <Link href="/" className="transition hover:text-violet-500">Home</Link>
            <Link href="/login" className="transition hover:text-violet-500">Log in</Link>
            <Link href="/signup" className="transition hover:text-violet-500">Sign up</Link>
            <Link href="/contact" className="transition hover:text-violet-500">Contact</Link>
          </div>
          <p>Rule-based assessment · Not a definitive fraud determination</p>
        </footer>
      </div>
    </main>
  );
}








