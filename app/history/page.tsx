"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { useWorkspaceTheme } from "@/app/components/theme-provider";
import type { AnalysisReport } from "@/lib/types";
import ReportActions from "@/app/components/report-actions";

type SavedReport = { id: string; report: AnalysisReport; analyzedAt: string };

function riskBadge(level: AnalysisReport["riskLevel"], dark: boolean) {
  if (level === "high") return dark ? "border-[#8e584b] bg-[#3b2925] text-[#e7b3a7]" : "border-[#dfb9ae] bg-[#f8e9e4] text-[#813d32]";
  if (level === "medium") return dark ? "border-[#847143] bg-[#373222] text-[#e3d29e]" : "border-[#dfd2a9] bg-[#f4eedc] text-[#70591b]";
  return dark ? "border-[#526b53] bg-[#26372a] text-[#b6ceb0]" : "border-[#c5d3bf] bg-[#e8efe4] text-[#35553b]";
}

export default function HistoryPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useWorkspaceTheme();
  const dark = theme === "dark";
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [selected, setSelected] = useState<SavedReport | null>(null);

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) { router.replace("/login?next=/history"); return; }
    setReady(true); setLoading(true); setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/reports?limit=100", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json() as { success: boolean; reports?: SavedReport[]; message?: string };
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load your reports.");
      setReports(data.reports ?? []); setSelected(null);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load your reports."); }
    finally { setLoading(false); }
  }), [router]);

  async function openReport(id: string) {
    const user = auth.currentUser;
    if (!user) return;
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/reports/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json() as { success: boolean; report?: SavedReport; message?: string };
      if (!response.ok || !data.success || !data.report) throw new Error(data.message || "Unable to load this report.");
      setSelected(data.report);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load this report."); }
  }

  const page = dark ? "bg-[#101612] text-[#f1f0e9]" : "bg-[#f2f1e9] text-[#20251f]";
  const panel = dark ? "border-[#303a34] bg-[#171e1a]" : "border-[#dedfd5] bg-[#fbfaf5]";
  const muted = dark ? "text-[#a4aca3]" : "text-[#687168]";

  if (!ready) return <main className={`flex min-h-screen items-center justify-center ${page}`}><p className={muted}>Checking your account…</p></main>;

  return (
    <main className={`workspace-page min-h-screen transition-colors duration-300 ${page}`}>
      <header className={`sticky top-0 z-20 border-b backdrop-blur-xl ${dark ? "border-[#303a34] bg-[#141b16]" : "border-[#d8d9cf] bg-[#f2f1e9]"}`}><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8"><div><Link href="/dashboard" className={`text-xs font-semibold ${muted}`}>← Workspace</Link><p className="mt-1 text-xl font-bold">Your reports</p></div><div className="flex gap-2"><Link href="/settings" className={`rounded-xl border px-3 py-2 text-sm ${dark ? "border-[#303a34]" : "border-[#d8d9cf]"}`}>Account</Link><button type="button" onClick={toggleTheme} className={`rounded-xl border px-3 py-2 text-sm ${dark ? "border-[#303a34]" : "border-[#d8d9cf]"}`}>{dark ? "☼ Light" : "☾ Dark"}</button><Link href="/verify" className="rounded-xl bg-[#3b5b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d4935]">＋ New review</Link></div></div></header>
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9"><div className="mb-6"><p className="text-[10px] font-bold tracking-[0.22em] text-[#748a5e]">PRIVATE TO YOUR ACCOUNT</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Analysis history</h1><p className={`mt-2 text-sm ${muted}`}>Your saved findings, recommendations, and shareable PDF copies.</p></div>
        {error && <p role="alert" className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-500">{error}</p>}
        <div className="grid items-start gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[0.2em] text-[#748a5e]">SAVED REVIEWS</p><h2 className="mt-1 text-lg font-bold">Your opportunities</h2></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${dark ? "bg-white/[0.06] text-slate-300" : "bg-slate-100 text-slate-600"}`}>{loading ? "…" : reports.length}</span></div>
            {loading ? <p className={`mt-5 rounded-2xl p-5 text-sm ${muted}`}>Loading your saved reports…</p> : reports.length === 0 ? <div className={`mt-5 rounded-2xl border border-dashed p-6 text-center ${dark ? "border-[#303a34]" : "border-[#d8d9cf]"}`}><p className="font-semibold">Nothing here yet</p><p className={`mt-2 text-sm leading-6 ${muted}`}>Your reports will appear here after you complete an analysis.</p><Link href="/verify" className="mt-4 inline-flex text-sm font-semibold text-[#748a5e]">Review an opportunity →</Link></div> : <ul className="mt-5 space-y-2">{reports.map((item) => <li key={item.id}><button type="button" onClick={() => void openReport(item.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === item.id ? (dark ? "border-violet-300/30 bg-violet-500/[0.08]" : "border-violet-300 bg-violet-50/60") : (dark ? "border-white/[0.07] hover:bg-white/[0.025]" : "border-slate-100 hover:bg-slate-50")}`}><div className="flex items-start justify-between gap-3"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.report.internship.company}</span><span className={`mt-1 block truncate text-xs ${muted}`}>{item.report.internship.title}</span></span><span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${riskBadge(item.report.riskLevel, dark)}`}>{item.report.riskLevel}</span></div><span className={`mt-3 flex items-center justify-between text-xs ${muted}`}><span>{new Date(item.analyzedAt).toLocaleString()}</span><span>{item.report.findings.length} signals · {item.report.riskScore}/100</span></span></button></li>)}</ul>}
          </section>

          <section className={`rounded-3xl border p-5 sm:p-7 ${panel}`}><p className="text-[10px] font-bold tracking-[0.2em] text-[#748a5e]">REPORT DETAILS</p>{selected ? <><div className="mt-3 flex flex-wrap items-start justify-between gap-4"><div><p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>{selected.report.internship.company}</p><h2 className="mt-1 text-2xl font-bold">{selected.report.internship.title}</h2><p className={`mt-2 text-sm ${muted}`}>Reviewed {new Date(selected.analyzedAt).toLocaleString()}</p></div><span className={`rounded-2xl border px-4 py-3 text-center ${riskBadge(selected.report.riskLevel, dark)}`}><span className="block text-[9px] font-bold tracking-[0.15em]">RISK SCORE</span><span className="mt-1 block text-xl font-bold">{selected.report.riskScore}<span className="text-xs font-medium"> /100</span></span><span className="mt-0.5 block text-[9px] font-bold uppercase">{selected.report.riskLevel}</span></span></div>
              <div className={`mt-5 rounded-2xl border p-4 ${dark ? "border-white/[0.07] bg-white/[0.025]" : "border-slate-100 bg-slate-50"}`}><p className="text-[10px] font-bold tracking-[0.18em] text-cyan-500">RECOMMENDED NEXT STEP</p><p className="mt-2 text-sm leading-6">{selected.report.recommendedAction}</p></div>
              <div className="mt-5"><ReportActions reportId={selected.id} /></div>
              <div className="mt-6"><h3 className="text-base font-bold">Findings <span className={`ml-1 text-sm font-medium ${muted}`}>({selected.report.findings.length})</span></h3>{selected.report.findings.length ? <ul className="mt-3 space-y-3">{selected.report.findings.map((finding, index) => <li key={`${finding.title}-${index}`} className={`rounded-2xl border p-4 ${dark ? "border-white/[0.07]" : "border-slate-100"}`}><div className="flex flex-wrap items-start justify-between gap-2"><h4 className="text-sm font-semibold">{finding.title}</h4><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${riskBadge(finding.severity, dark)}`}>{finding.severity}</span></div><p className={`mt-2 text-sm leading-6 ${muted}`}>{finding.description}</p>{finding.evidence.length > 0 && <div className={`mt-3 rounded-xl p-3 text-xs leading-5 ${dark ? "bg-white/[0.03]" : "bg-slate-50"}`}><span className="font-semibold">Matched evidence: </span>{finding.evidence.join(" · ")}</div>}</li>)}</ul> : <p className={`mt-3 rounded-2xl border border-dashed p-4 text-sm ${muted}`}>No common warning indicators matched the details provided. Still verify the offer independently.</p>}</div>
              <details className={`mt-5 rounded-2xl border p-4 ${dark ? "border-white/[0.07]" : "border-slate-100"}`}><summary className="cursor-pointer text-sm font-semibold">Checks and report limitations</summary><div className={`mt-4 space-y-3 text-xs leading-5 ${muted}`}><div><p className="font-semibold text-current">Checks performed</p><ul className="mt-2 list-inside list-disc space-y-1">{selected.report.checksPerformed.map((item) => <li key={item}>{item}</li>)}</ul></div><div><p className="font-semibold text-current">Limitations</p><ul className="mt-2 list-inside list-disc space-y-1">{selected.report.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div></div></details>
            </> : <div className={`mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center ${dark ? "border-[#303a34] bg-white/[0.02]" : "border-[#d8d9cf] bg-slate-50"}`}><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-[#748a5e]">▤</span><h2 className="mt-4 text-lg font-bold">Select a saved report</h2><p className={`mt-2 max-w-sm text-sm leading-6 ${muted}`}>Choose an opportunity to see its risk summary, findings, evidence, and recommended next steps.</p></div>}</section>
        </div><p className={`mt-6 text-xs leading-5 ${muted}`}>Screening information only. A score is not proof of fraud or legitimacy. Independently verify important claims.</p>
      </div>
    </main>
  );
}
