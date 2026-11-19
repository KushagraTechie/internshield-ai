"use client";

import { useState } from "react";
import { auth } from "@/app/lib/firebase";

export default function ReportActions({ reportId, downloadOnly = false }: { reportId: string; downloadOnly?: boolean }) {
  const [busy, setBusy] = useState<"pdf" | "email" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function downloadPdf() {
    const user = auth.currentUser;
    if (!user) return setError("Sign in to download this report.");
    setBusy("pdf"); setError(""); setNotice("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}/pdf`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) {
        const data = await response.json() as { message?: string };
        throw new Error(data.message || "Couldn't create the PDF.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = "internshield-opportunity-report.pdf";
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      setNotice("Your PDF download has started.");
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn't download the report."); }
    finally { setBusy(null); }
  }

  async function emailPdf() {
    const user = auth.currentUser;
    if (!user) return setError("Sign in to email this report.");
    setBusy("email"); setError(""); setNotice("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}/email`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json() as { success?: boolean; code?: string; message?: string };
      if (!response.ok || !data.success) {
        if (data.code === "EMAIL_DELIVERY_FAILED" || response.status === 503) {
          setNotice("Your report is ready to download here.");
          return;
        }
        throw new Error(data.message || "Couldn't email this report.");
      }
      setNotice(data.message || "PDF sent to your account email.");
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn't email the report."); }
    finally { setBusy(null); }
  }

  return (
    <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.10] to-cyan-400/[0.04] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">↗</span>
        <div><h3 className="font-semibold">Keep a copy of your review</h3><p className="mt-1 text-xs leading-5 text-current opacity-70">{downloadOnly ? "Download a polished PDF copy of this report." : "Download a polished PDF or send it to your verified account email."}</p></div>
      </div>
      <div className={`mt-4 grid gap-2 ${downloadOnly ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <button type="button" onClick={() => void downloadPdf()} disabled={!!busy} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60">{busy === "pdf" ? "Preparing PDF…" : "Download report PDF"}</button>
        {!downloadOnly && <button type="button" onClick={() => void emailPdf()} disabled={!!busy} className="rounded-xl border border-current/15 px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.05] disabled:opacity-60">{busy === "email" ? "Sending email…" : "Email me this PDF"}</button>}
      </div>
      {notice && <p role="status" className="mt-3 text-xs leading-5 text-emerald-500">{notice}</p>}
      {error && <p role="alert" className="mt-3 text-xs leading-5 text-amber-600">{error}</p>}
    </div>
  );
}
