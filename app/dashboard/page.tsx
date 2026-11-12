"use client";

import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { useWorkspaceTheme } from "@/app/components/theme-provider";
import type { AnalysisReport } from "@/lib/types";

type SavedReport = { id: string; report: AnalysisReport; analyzedAt: string };

function riskLabel(level: AnalysisReport["riskLevel"]) {
  if (level === "high") return "High risk";
  if (level === "medium") return "Review carefully";
  return "Fewer warnings";
}

function UserAvatar({ user, dark }: { user: User | null; dark: boolean }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold ${dark ? "bg-[#31453b] text-[#d6e5d8]" : "bg-[#dce8dc] text-[#355844]"}`}>
      {user?.photoURL ? <span aria-label="Profile photo" role="img" className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${user.photoURL.replaceAll('"', '%22')}")` }} /> : user?.displayName?.trim().charAt(0).toUpperCase() || "S"}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useWorkspaceTheme();
  const dark = theme === "dark";
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (activeUser) => {
    if (!activeUser) { router.replace("/login?next=/dashboard"); return; }
    setUser(activeUser);
    void (async () => {
      setLoading(true); setError("");
      try {
        const token = await activeUser.getIdToken();
        const response = await fetch("/api/reports?limit=100", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const data = await response.json() as { success: boolean; reports?: SavedReport[]; message?: string };
        if (!response.ok || !data.success) throw new Error(data.message || "Your reports could not be loaded.");
        setReports(data.reports ?? []);
      } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Your reports could not be loaded."); }
      finally { setLoading(false); }
    })();
  }), [router]);

  const totals = useMemo(() => ({
    reviews: reports.length,
    followUp: reports.filter(({ report }) => report.riskLevel !== "low").length,
    signals: reports.reduce((count, item) => count + (item.report.findings?.length ?? 0), 0),
  }), [reports]);

  async function handleLogout() {
    setLoggingOut(true);
    try { await signOut(auth); router.replace("/login"); }
    catch { setError("Could not sign out just now. Please try again."); setLoggingOut(false); }
  }

  const surface = dark ? "border-[#303a34] bg-[#171e1a]" : "border-[#dedfd5] bg-[#fbfaf5]";
  const muted = dark ? "text-[#a4aca3]" : "text-[#6c746b]";
  const rule = dark ? "border-[#303a34]" : "border-[#dedfd5]";
  const navItems = [
    { href: "/dashboard", label: "Overview", num: "01" },
    { href: "/verify", label: "Review an offer", num: "02" },
    { href: "/history", label: "Saved reports", num: "03" },
    { href: "/settings", label: "Account settings", num: "04" },
  ];

  return (
    <main className={`workspace-page min-h-screen transition-colors duration-300 md:flex ${dark ? "bg-[#101612] text-[#f1f0e9]" : "bg-[#f2f1e9] text-[#20251f]"}`}>
      <aside className={`flex w-full shrink-0 flex-col border-b md:sticky md:top-0 md:h-screen md:w-[248px] md:border-b-0 md:border-r ${dark ? "border-[#303a34] bg-[#141b16]" : "border-[#d8d9cf] bg-[#e9e9df]"}`}>
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-5 md:px-6 md:py-7 ${rule}`}>
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="" width={40} height={40} className="h-9 w-9 object-contain" />
            <span className="min-w-0"><span className="block truncate text-[14px] font-semibold tracking-tight">InternShield <span className="text-[#8b6fbd]">AI</span></span><span className={`mt-1 block text-[10px] uppercase tracking-[0.15em] ${muted}`}>Student workspace</span></span>
          </Link>
          <button type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm ${rule} ${muted}`}>{dark ? "☼" : "☾"}</button>
        </div>

        <nav aria-label="Workspace navigation" className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:gap-0.5 md:overflow-y-auto md:px-4 md:py-7">
          <p className={`hidden px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.2em] md:block ${muted}`}>Your workspace</p>
          {navItems.map((item) => <Link key={item.href} href={item.href} aria-current={item.href === "/dashboard" ? "page" : undefined} className={`flex shrink-0 items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition ${item.href === "/dashboard" ? (dark ? "border-[#b7ca91] bg-[#202a22] text-[#f1f0e9]" : "border-[#607c52] bg-[#dddfd2] text-[#283326]") : `border-transparent ${muted} ${dark ? "hover:bg-[#1b241d] hover:text-white" : "hover:bg-[#e1e2d8] hover:text-[#20251f]"}`}`}><span className={`font-mono text-[10px] ${item.href === "/dashboard" ? "text-[#9cab7a]" : muted}`}>{item.num}</span>{item.label}</Link>)}
        </nav>

        <div className={`hidden border-t p-4 md:block ${rule}`}>
          <Link href="/settings" className={`flex items-center gap-3 px-2 py-2 ${dark ? "hover:bg-[#1b241d]" : "hover:bg-[#e1e2d8]"}`}><UserAvatar user={user} dark={dark} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{user?.displayName || "Student account"}</span><span className={`mt-0.5 block truncate text-xs ${muted}`}>{user?.email}</span></span><span className={muted}>↗</span></Link>
          <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className={`mt-2 w-full px-2 py-2 text-left text-xs ${muted} hover:text-[#bd7662] disabled:opacity-50`}>{loggingOut ? "Signing out…" : "Sign out"}</button>
        </div>
      </aside>

      <section className="min-w-0 flex-1 px-5 pb-10 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pt-10">
        <header className={`flex flex-wrap items-end justify-between gap-5 border-b pb-6 ${rule}`}>
          <div><p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${dark ? "text-[#a8b88c]" : "text-[#627d50]"}`}>Opportunity desk <span className={muted}>/ overview</span></p><h1 className="mt-3 font-serif text-3xl font-medium tracking-[-0.035em] sm:text-[40px]">{user?.displayName ? `Welcome back, ${user.displayName.split(" ")[0]}.` : "Welcome to your workspace."}</h1><p className={`mt-2 max-w-xl text-sm leading-6 ${muted}`}>A clear view of the opportunities you have reviewed and the details that need another look.</p></div>
          <div className="flex items-center gap-3"><Link href="/settings" className={`flex h-10 items-center gap-2 border px-3 text-sm ${rule}`}><UserAvatar user={user} dark={dark} /><span className="hidden sm:inline">Account</span></Link><Link href="/verify" className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-medium ${dark ? "bg-[#d5dfb4] text-[#1f2d20] hover:bg-[#e2ebc5]" : "bg-[#3b5b43] text-white hover:bg-[#2d4935]"}`}>Start a review <span aria-hidden="true">↗</span></Link><button type="button" onClick={() => void handleLogout()} disabled={loggingOut} aria-label="Sign out" className={`flex h-10 w-10 items-center justify-center border text-sm ${rule} ${muted}`}>{loggingOut ? "…" : "↗"}</button></div>
        </header>

        {user && !user.emailVerified && <div className={`mt-5 flex flex-wrap items-center justify-between gap-3 border px-4 py-3 text-sm ${dark ? "border-[#6b5831] bg-[#2b261b] text-[#e9dba9]" : "border-[#dfd1a9] bg-[#f7f0dc] text-[#6d571a]"}`}><span>Please confirm your email before starting an analysis.</span><Link href="/verify-email" className="font-semibold underline underline-offset-4">Verify email</Link></div>}
        {error && <p role="alert" className="mt-5 border border-[#8e4c42] bg-[#4a2926] px-4 py-3 text-sm text-[#f2c4b6]">{error}</p>}

        <section aria-label="Your review summary" className={`mt-6 grid border-y ${rule} sm:grid-cols-3`}>
          {[{ label: "Reviews saved", value: totals.reviews, note: "Completed assessments" }, { label: "Need follow-up", value: totals.followUp, note: "Medium or high signals" }, { label: "Signals observed", value: totals.signals, note: "Across loaded reports" }].map((stat, index) => <div key={stat.label} className={`flex items-center justify-between gap-4 py-4 sm:px-5 ${index ? `border-t sm:border-l sm:border-t-0 ${rule}` : ""}`}><div><p className={`text-xs ${muted}`}>{stat.label}</p><p className="mt-1 font-serif text-[30px] leading-none">{loading ? "—" : stat.value}</p></div><p className={`text-right text-[10px] leading-4 ${muted}`}>{stat.note}</p></div>)}
        </section>

        <div className="mt-7 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section>
            <div className={`flex flex-wrap items-end justify-between gap-3 border-b pb-3 ${rule}`}><div><p className={`font-mono text-[9px] uppercase tracking-[0.18em] ${dark ? "text-[#a8b88c]" : "text-[#627d50]"}`}>Your records</p><h2 className="mt-1 font-serif text-2xl font-medium">Recent reviews</h2></div><Link href="/history" className={`text-xs underline decoration-current/30 underline-offset-4 ${muted}`}>Open full history ↗</Link></div>
            {loading ? <div className={`py-12 text-sm ${muted}`}>Loading your saved reports…</div> : reports.length === 0 ? <div className={`py-12`}><p className="font-serif text-xl">Your first review will appear here.</p><p className={`mt-2 max-w-md text-sm leading-6 ${muted}`}>Enter an internship offer to see a structured review, warning signals, and recommended checks.</p><Link href="/verify" className={`mt-5 inline-flex border-b pb-1 text-sm font-medium ${dark ? "border-[#a8b88c] text-[#c7d4a8]" : "border-[#627d50] text-[#3b5b43]"}`}>Review an opportunity ↗</Link></div> : <div className="divide-y divide-current/10">{reports.slice(0, 6).map((item) => <Link key={item.id} href="/history" className={`group grid gap-3 py-4 transition sm:grid-cols-[minmax(0,1fr)_145px_110px] sm:items-center ${dark ? "hover:bg-white/[0.025]" : "hover:bg-black/[0.018]"}`}><span className="min-w-0"><span className="block truncate text-sm font-medium group-hover:underline decoration-current/30 underline-offset-4">{item.report.internship.company}</span><span className={`mt-1 block truncate text-xs ${muted}`}>{item.report.internship.title}</span></span><span className={`text-xs ${muted}`}>{new Date(item.analyzedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span><span className="flex items-center justify-between gap-2 sm:justify-end"><span className={`text-[10px] font-semibold ${item.report.riskLevel === "high" ? (dark ? "text-[#e4a395]" : "text-[#994536]") : item.report.riskLevel === "medium" ? (dark ? "text-[#e3cf96]" : "text-[#806321]") : (dark ? "text-[#b1d0b8]" : "text-[#356149]")}`}>{riskLabel(item.report.riskLevel)}</span><span className={`font-mono text-[10px] ${muted}`}>{item.report.riskScore}</span></span></Link>)}</div>}
          </section>

          <aside className={`border p-5 ${surface}`}>
            <p className={`font-mono text-[9px] uppercase tracking-[0.17em] ${dark ? "text-[#a8b88c]" : "text-[#627d50]"}`}>Quick start</p>
            <h2 className="mt-3 font-serif text-[23px] leading-tight">Check the offer, not just the promise.</h2>
            <p className={`mt-3 text-xs leading-5 ${muted}`}>A few details can make an opportunity easier to verify. Keep the original description close by.</p>
            <Link href="/verify" className={`mt-5 flex items-center justify-between border-t pt-4 text-sm font-medium ${rule}`}><span>Open review form</span><span aria-hidden="true">↗</span></Link>
            <div className={`mt-5 border-t pt-4 ${rule}`}><p className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${muted}`}>Look out for</p><ul className={`mt-3 space-y-2 text-xs ${muted}`}><li className="flex gap-2"><span className="text-[#b56a4b]">—</span>Fees before an offer</li><li className="flex gap-2"><span className="text-[#b56a4b]">—</span>Pressure to act today</li><li className="flex gap-2"><span className="text-[#b56a4b]">—</span>Requests for passwords or codes</li></ul></div>
          </aside>
        </div>

        <footer className={`mt-10 flex flex-wrap justify-between gap-3 border-t pt-4 font-mono text-[9px] uppercase tracking-[0.12em] ${rule} ${muted}`}><span>InternShield AI · Student safety workspace</span><span>Information for review. Verify employers independently.</span></footer>
      </section>
    </main>
  );
}
