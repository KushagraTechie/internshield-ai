"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./lib/firebase";
import { useWorkspaceTheme } from "./components/theme-provider";

const checks = [
  { number: "01", title: "Money up front", text: "Registration fees, deposits, or payment to secure a role." },
  { number: "02", title: "Pressure to decide", text: "Urgency that discourages you from checking the offer." },
  { number: "03", title: "Unusual requests", text: "Passwords, one-time codes, or sensitive details too early." },
  { number: "04", title: "Offer details", text: "Recruiter email, application URL, and role description." },
];

export default function Home() {
  const router = useRouter();
  const { theme: mode, toggleTheme } = useWorkspaceTheme();
  const dark = mode === "dark";
  const [signedIn, setSignedIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (user) => setSignedIn(!!user)), []);

  async function logout() {
    setLoggingOut(true);
    try { await signOut(auth); router.replace("/login"); }
    catch { setLoggingOut(false); window.alert("Could not sign out right now. Please try again."); }
  }

  const page = dark ? "bg-[#101612] text-[#f1f0e9]" : "bg-[#f2f1e9] text-[#20251f]";
  const muted = dark ? "text-[#a4aca3]" : "text-[#687168]";
  const rule = dark ? "border-[#303a34]" : "border-[#d8d9cf]";
  const paper = dark ? "bg-[#171e1a]" : "bg-[#fbfaf5]";

  return (
    <main className={`min-h-screen transition-colors duration-300 ${page}`}>
      <header className={`border-b ${rule}`}>
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3" aria-label="InternShield AI home">
            <Image src="/logo.png" alt="" width={42} height={42} priority className="h-10 w-10 object-contain" />
            <span><span className="block text-sm font-semibold tracking-tight">InternShield <span className="text-[#8b6fbd]">AI</span></span><span className={`mt-0.5 block text-[9px] uppercase tracking-[0.16em] ${muted}`}>A ByteSentinels project</span></span>
          </Link>
          <nav className={`hidden items-center gap-7 text-xs md:flex ${muted}`} aria-label="Main navigation"><a href="#review-process" className="hover:text-current">How it works</a><a href="#what-we-check" className="hover:text-current">What we check</a><a href="#safety" className="hover:text-current">Safety note</a><Link href="/contact" className="hover:text-current">Contact</Link></nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} className={`flex h-9 w-9 items-center justify-center border text-sm ${rule} ${muted}`}>{dark ? "☼" : "☾"}</button>
            {signedIn ? <><Link href="/dashboard" className={`hidden h-9 items-center border px-3 text-xs font-medium sm:flex ${rule}`}>My workspace</Link><button type="button" onClick={() => void logout()} disabled={loggingOut} className={`h-9 border px-3 text-xs ${rule} ${muted}`}>{loggingOut ? "Signing out…" : "Sign out"}</button></> : <><Link href="/login" className={`hidden h-9 items-center px-3 text-xs font-medium sm:flex ${muted}`}>Sign in</Link><Link href="/signup" className={`flex h-9 items-center px-3 text-xs font-medium ${dark ? "bg-[#d5dfb4] text-[#1f2d20]" : "bg-[#3b5b43] text-white"}`}>Create account</Link></>}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.03fr_.97fr] lg:gap-20 lg:px-12 lg:pb-28 lg:pt-24">
        <div>
          <p className={`font-mono text-[10px] font-medium uppercase tracking-[0.18em] ${dark ? "text-[#a8b88c]" : "text-[#627d50]"}`}>For students weighing an internship offer</p>
          <h1 className="mt-5 max-w-2xl font-serif text-[42px] font-medium leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[68px]">Before you say yes,<br /><span className={dark ? "text-[#c5d2a4]" : "text-[#526e45]"}>check the details.</span></h1>
          <p className={`mt-6 max-w-xl text-[15px] leading-7 sm:text-base ${muted}`}>InternShield helps you look closely at an internship offer, understand common warning signs, and keep a clear record of what you found.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/verify" className={`inline-flex h-12 items-center gap-3 px-5 text-sm font-medium transition ${dark ? "bg-[#d5dfb4] text-[#1f2d20] hover:bg-[#e2ebc5]" : "bg-[#3b5b43] text-white hover:bg-[#2d4935]"}`}>Review an offer <span aria-hidden="true">↗</span></Link><Link href={signedIn ? "/history" : "/login"} className={`inline-flex h-12 items-center border px-5 text-sm ${rule} ${muted}`}>{signedIn ? "View saved reports" : "I already have an account"}</Link></div>
          <div className={`mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-[11px] ${rule} ${muted}`}><span>Private account history</span><span>Evidence shown with each warning</span><span>Practical next steps</span></div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className={`absolute -left-5 top-8 hidden h-[calc(100%-4rem)] w-5 border-y border-l lg:block ${rule}`} />
          <article className={`relative border p-5 shadow-[0_18px_55px_rgba(19,28,20,0.08)] sm:p-7 ${paper} ${rule}`}>
            <div className={`flex items-start justify-between gap-4 border-b pb-4 ${rule}`}><div><p className={`font-mono text-[9px] uppercase tracking-[0.17em] ${muted}`}>Sample report · Example only</p><h2 className="mt-2 font-serif text-2xl font-medium">Frontend Developer Intern</h2><p className={`mt-1 text-xs ${muted}`}>BrightPath Technologies</p></div><span className={`font-mono text-[10px] ${muted}`}>IS—001</span></div>
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 border-b py-5 sm:grid-cols-[120px_1fr] sm:gap-x-7 sm:py-6">
              <div className="row-span-2 flex h-[94px] w-[94px] flex-col items-center justify-center rounded-full border-[7px] text-center sm:h-[112px] sm:w-[112px]" style={{ borderColor: dark ? "#6c493c" : "#d9aaa0" }}><span className="font-serif text-[31px] leading-none">72</span><span className={`mt-1 font-mono text-[8px] uppercase tracking-[0.13em] ${muted}`}>of 100</span></div>
              <div><p className={`font-mono text-[9px] uppercase tracking-[0.16em] ${muted}`}>Review result</p><p className="mt-1 font-serif text-xl">Look closer</p><p className={`mt-1 text-xs leading-5 ${muted}`}>Several details deserve independent checks.</p></div>
              <div className={`h-[3px] overflow-hidden ${dark ? "bg-[#303a34]" : "bg-[#e0ded4]"}`}><span className="block h-full w-[72%] bg-[#b36d57]" /></div>
            </div>
            <div className="py-5">
              <div className="flex items-center justify-between gap-3"><h3 className="text-xs font-semibold">Signals to review</h3><span className={`font-mono text-[9px] uppercase tracking-[0.12em] ${muted}`}>2 observations</span></div>
              <div className={`mt-3 border-l-2 border-[#b36d57] py-1 pl-3`}><p className="text-xs font-medium">Registration fee requested</p><p className={`mt-1 text-[11px] leading-5 ${muted}`}>The listing asks for payment before the internship begins.</p></div>
              <div className={`mt-4 border-l-2 ${dark ? "border-[#b7a064]" : "border-[#b7a064]"} py-1 pl-3`}><p className="text-xs font-medium">Immediate decision pressure</p><p className={`mt-1 text-[11px] leading-5 ${muted}`}>The message urges applicants to act before verifying details.</p></div>
            </div>
            <div className={`flex items-start gap-3 border-t pt-4 ${rule}`}><span className={`mt-0.5 font-serif text-lg ${dark ? "text-[#c5d2a4]" : "text-[#526e45]"}`}>i</span><p className={`text-[10px] leading-5 ${muted}`}>A screening result is not proof of fraud or legitimacy. Verify the employer using independently located official sources.</p></div>
          </article>
          <p className={`mt-3 text-right font-mono text-[9px] uppercase tracking-[0.12em] ${muted}`}>Illustrative interface · not a real company assessment</p>
        </div>
      </section>

      <section id="what-we-check" className={`border-y ${rule} ${dark ? "bg-[#141b16]" : "bg-[#e9e9df]"}`}>
        <div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12"><div className="grid gap-7 md:grid-cols-[.7fr_1.3fr]"><div><p className={`font-mono text-[9px] uppercase tracking-[0.18em] ${dark ? "text-[#a8b88c]" : "text-[#627d50]"}`}>A practical first pass</p><h2 className="mt-3 max-w-sm font-serif text-3xl font-medium leading-tight">Small details can change the story.</h2><p className={`mt-3 max-w-sm text-sm leading-6 ${muted}`}>The current checks look for common recruitment warning signs in the information you provide.</p></div><div className={`grid border-l ${rule} sm:grid-cols-2`}>{checks.map((item, index) => <article key={item.number} className={`border-b py-4 pl-5 sm:px-5 ${index % 2 ? "sm:border-l" : ""} ${rule} ${index > 1 ? "sm:border-b-0" : ""}`}><p className={`font-mono text-[9px] ${muted}`}>{item.number}</p><h3 className="mt-2 text-sm font-semibold">{item.title}</h3><p className={`mt-1 max-w-xs text-xs leading-5 ${muted}`}>{item.text}</p></article>)}</div></div></div>
      </section>

      <section id="review-process" className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className={`font-mono text-[9px] uppercase tracking-[0.18em] ${dark ? "text-[#a8b88c]" : "text-[#627d50]"}`}>A clearer way to review</p><h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">The process is straightforward.</h2></div><p className={`max-w-md text-sm leading-6 ${muted}`}>We organize the details you enter and explain what triggered each warning. You stay in control of the decision.</p></div>
        <div className={`mt-9 grid border-y ${rule} sm:grid-cols-3`}>{[{ n: "01", title: "Add the offer", copy: "Enter the company, role, description, and any contact or application details." }, { n: "02", title: "Read the signals", copy: "Review each observation, the wording that triggered it, and its severity." }, { n: "03", title: "Check independently", copy: "Use the suggested next steps to verify important claims through official sources." }].map((step, index) => <article key={step.n} className={`py-5 sm:px-6 sm:py-6 ${index ? `border-t sm:border-l sm:border-t-0 ${rule}` : ""}`}><p className={`font-mono text-[10px] ${dark ? "text-[#a8b88c]" : "text-[#627d50]"}`}>{step.n}</p><h3 className="mt-3 font-serif text-xl">{step.title}</h3><p className={`mt-2 max-w-xs text-xs leading-5 ${muted}`}>{step.copy}</p></article>)}</div>
      </section>

      <section id="safety" className={`border-t ${rule}`}><div className="mx-auto grid max-w-[1320px] gap-6 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:items-center lg:px-12"><div><p className={`font-mono text-[9px] uppercase tracking-[0.18em] ${dark ? "text-[#d0a679]" : "text-[#966342]"}`}>Use your judgment</p><h2 className="mt-2 font-serif text-2xl font-medium">A score is a prompt to ask questions.</h2><p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>We combine rule-based checks with a limited public website scan and, when configured, Google Web Risk threat-list lookups. We cannot confirm company registration or prove a specific offer is genuine.</p></div><Link href="/contact" className={`inline-flex h-10 items-center justify-center border px-4 text-xs ${rule} ${muted}`}>About this project ↗</Link></div></section>

      <footer className={`border-t ${rule}`}><div className={`mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-5 py-5 text-[10px] ${muted} sm:px-8 lg:px-12`}><span>InternShield AI · ByteSentinels</span><nav aria-label="Footer navigation" className="flex flex-wrap gap-5"><Link href="/contact" className="hover:text-current">Contact</Link><Link href="/login" className="hover:text-current">Sign in</Link><Link href="/signup" className="hover:text-current">Create account</Link></nav><span>Kushagra Bajpai · Founder & Lead Developer · © 2026</span></div></footer>
    </main>
  );
}
