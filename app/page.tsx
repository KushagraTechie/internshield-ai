
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const features = [
  {
    number: "01",
    icon: "⌕",
    title: "Internship intelligence",
    description:
      "Review internship descriptions, recruiter details, application links, and suspicious requests in one organized workflow.",
    tag: "OPPORTUNITY REVIEW",
  },
  {
    number: "02",
    icon: "◈",
    title: "Company signal analysis",
    description:
      "Bring together available company information and warning indicators to support a more informed decision.",
    tag: "COMPANY SIGNALS",
  },
  {
    number: "03",
    icon: "⛨",
    title: "Explainable risk insights",
    description:
      "See which indicators deserve attention and why, instead of relying on an unexplained score alone.",
    tag: "TRANSPARENT RESULTS",
  },
  {
    number: "04",
    icon: "⌁",
    title: "Evidence-first decisions",
    description:
      "Keep evidence and observations at the centre of your review. A warning signal is a reason to investigate, not proof of fraud.",
    tag: "EVIDENCE REVIEW",
  },
];

const workflow = [
  {
    number: "01",
    title: "Submit an opportunity",
    description:
      "Start with the internship description, company details, or application URL you want to review.",
  },
  {
    number: "02",
    title: "Review available signals",
    description:
      "Examine relevant indicators, suspicious requests, and available supporting evidence.",
  },
  {
    number: "03",
    title: "Make an informed decision",
    description:
      "Understand the findings and decide what to verify before sharing information or accepting an offer.",
  },
];

const securityItems = [
  {
    icon: "⌑",
    title: "Secure access",
    description:
      "Designed for authenticated accounts and appropriate access controls.",
  },
  {
    icon: "◈",
    title: "Privacy-conscious design",
    description:
      "Sensitive information should be collected only when necessary and handled carefully.",
  },
  {
    icon: "◎",
    title: "Abuse protection",
    description:
      "Rate limiting, input validation, and API protection belong in the production implementation.",
  },
  {
    icon: "≋",
    title: "Accountability",
    description:
      "Audit logs and administrative controls can support responsible platform operations.",
  },
];

export default function Home() {
  const [lightMode, setLightMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoTab, setDemoTab] = useState("overview");

  const theme = lightMode
    ? {
        page: "bg-[#F8F8FF] text-[#17172A]",
        nav: "border-violet-950/10 bg-white/85",
        muted: "text-slate-600",
        card: "border-violet-950/10 bg-white",
        soft: "bg-violet-50",
        input: "border-violet-950/10 bg-white",
        footer: "border-violet-950/10",
      }
    : {
        page: "bg-[#080B16] text-white",
        nav: "border-white/10 bg-[#080B16]/85",
        muted: "text-slate-400",
        card: "border-white/10 bg-[#101426]",
        soft: "bg-white/[0.035]",
        input: "border-white/10 bg-[#090D1A]",
        footer: "border-white/10",
      };

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Security", href: "#security" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${theme.page}`}
    >
      {/* Ambient background */}
      <div
        className={`pointer-events-none absolute -left-64 top-36 h-[500px] w-[500px] rounded-full blur-[150px] ${
          lightMode ? "bg-violet-300/30" : "bg-violet-700/15"
        }`}
      />
      <div
        className={`pointer-events-none absolute right-[-200px] top-[700px] h-[500px] w-[500px] rounded-full blur-[150px] ${
          lightMode ? "bg-cyan-200/30" : "bg-cyan-700/10"
        }`}
      />

      {/* Navigation */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${theme.nav}`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
            aria-label="InternShield AI home"
          >
            <Image
              src="/logo.png"
              alt="InternShield shield logo"
              width={52}
              height={52}
              priority
              className="h-11 w-11 object-contain sm:h-12 sm:w-12"
            />
            <span>
              <span className="block text-base font-bold tracking-tight sm:text-lg">
                InternShield{" "}
                <span className="text-violet-500">AI</span>
              </span>
              <span
                className={`block text-[10px] tracking-wide sm:text-xs ${theme.muted}`}
              >
                by ByteSentinels
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition hover:text-violet-500 ${
                  index === 0 ? "text-violet-500" : theme.muted
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setLightMode(!lightMode)}
              aria-label={
                lightMode ? "Switch to dark mode" : "Switch to light mode"
              }
              title={lightMode ? "Dark mode" : "Light mode"}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition hover:border-violet-500 ${
                lightMode
                  ? "border-violet-200 bg-white text-violet-700"
                  : "border-white/10 bg-white/[0.04] text-amber-300"
              }`}
            >
              {lightMode ? "☾" : "☼"}
            </button>

            <Link
              href="/login"
              className={`hidden rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:border-violet-500 sm:inline-flex ${
                lightMode
                  ? "border-violet-200 hover:bg-violet-50"
                  : "border-white/10 hover:bg-white/5"
              }`}
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="hidden rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 sm:inline-flex"
            >
              Get started <span className="ml-2">↗</span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
              className={`flex h-10 w-10 items-center justify-center rounded-xl border lg:hidden ${
                lightMode ? "border-violet-200" : "border-white/10"
              }`}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            className={`border-t px-5 py-4 lg:hidden ${theme.footer}`}
          >
            <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-violet-500/10 hover:text-violet-500 ${theme.muted}`}
                >
                  {item.label} <span className="float-right">↗</span>
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm ${theme.muted}`}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Create your account
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-5 pb-12 pt-6 sm:px-8 sm:pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:px-12 lg:pb-16 lg:pt-12"
      >
        <div className="relative z-10">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide ${
              lightMode
                ? "border-violet-200 bg-violet-50 text-violet-800"
                : "border-violet-400/20 bg-violet-500/10 text-violet-300"
            }`}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            A SMARTER WAY TO REVIEW INTERNSHIPS
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
            Your next opportunity.
            <span className="mt-3 block bg-gradient-to-r from-violet-500 via-purple-400 to-cyan-400 bg-clip-text pb-2 text-transparent">
              Verified with confidence.
            </span>
          </h1>

          <p
            className={`mt-7 max-w-2xl text-base leading-8 sm:text-lg ${theme.muted}`}
          >
            Not every internship offer is what it seems. InternShield AI
            helps students examine warning signs, review available evidence,
            and make more informed decisions before they commit.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/verify"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-violet-600 px-6 py-4 font-semibold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-500"
            >
              Verify an internship
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="#how-it-works"
              className={`inline-flex items-center justify-center gap-3 rounded-xl border px-6 py-4 font-semibold transition hover:border-violet-500 ${
                lightMode
                  ? "border-violet-200 hover:bg-violet-50"
                  : "border-white/10 hover:bg-white/[0.04]"
              }`}
            >
              Explore how it works <span>↓</span>
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {[
              "Evidence-focused",
              "Privacy-conscious",
              "Explainable insights",
            ].map((item) => (
              <span key={item} className={`flex items-center gap-2 ${theme.muted}`}>
                <span className="text-emerald-500">✓</span>
                {item}
              </span>
            ))}
          </div>

          {/* Creator credit */}
          <div className={`mt-12 flex items-center gap-4 border-t pt-6 ${theme.footer}`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-lg font-bold text-violet-500">
              K
            </div>

            <div className="min-w-0">
              <p className={`text-xs font-medium uppercase tracking-[0.16em] ${theme.muted}`}>
                Built by ByteSentinels
              </p>
              <p className="mt-1 text-sm font-semibold">
                Kushagra Bajpai
                <span className={`ml-2 text-xs font-normal ${theme.muted}`}>
                  · Founder & Lead Developer
                </span>
              </p>
              <p className={`mt-1 text-xs ${theme.muted}`}>
                Building smarter internship verification experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Custom verification preview */}
        <div className="relative mx-auto w-full max-w-[570px]">
          <div className="pointer-events-none absolute inset-10 rounded-full bg-violet-600/20 blur-[90px]" />

          <div
            className={`relative overflow-hidden rounded-[28px] border p-5 shadow-2xl sm:p-7 ${
              lightMode
                ? "border-violet-200 bg-white shadow-violet-200/40"
                : "border-white/10 bg-[#101426] shadow-black/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs ${theme.muted}`}>
                  INTERNSHIELD INTELLIGENCE
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  Opportunity overview
                </h2>
                <p className={`mt-1 text-sm ${theme.muted}`}>
                  An illustrative interface
                </p>
              </div>
              <span className="rounded-lg bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-500">
                AI-assisted
              </span>
            </div>

            <div className="relative my-7 flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-cyan-500/[0.08]">
              <div className="absolute h-48 w-48 rounded-full border border-violet-500/20" />
              <div className="absolute h-36 w-36 rounded-full border border-dashed border-violet-500/30" />
              <div className="absolute h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />

              <div className="relative flex h-36 w-32 items-center justify-center">
                <svg
                  viewBox="0 0 140 160"
                  className="h-full w-full drop-shadow-[0_0_18px_rgba(139,92,246,0.35)]"
                  fill="none"
                  aria-label="Shield verification illustration"
                  role="img"
                >
                  <defs>
                    <linearGradient id="shieldGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#C4B5FD" />
                      <stop offset="55%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M70 5 L128 30 V72 C128 111 103 139 70 155 C37 139 12 111 12 72 V30 Z"
                    fill="url(#shieldGradient)"
                    fillOpacity="0.15"
                    stroke="url(#shieldGradient)"
                    strokeWidth="5"
                  />
                  <path
                    d="M70 22 L111 40 V73 C111 101 94 121 70 135 C46 121 29 101 29 73 V40 Z"
                    stroke="#A78BFA"
                    strokeWidth="2"
                  />
                  <rect x="43" y="60" width="54" height="43" rx="10" fill="#8B5CF6" />
                  <path d="M53 74 H87 M53 85 H77" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="101" cy="54" r="14" fill="#0EA5E9" stroke="#BAE6FD" strokeWidth="2.5" />
                  <path d="M101 47 V61 M94 54 H108" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <span className="absolute left-4 top-4 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] font-semibold text-cyan-500 sm:text-xs">
                ◈ Company signals
              </span>
              <span className="absolute bottom-4 right-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold text-emerald-500 sm:text-xs">
                ✓ Evidence review
              </span>
            </div>

            <div className={`rounded-2xl border p-4 sm:p-5 ${theme.footer}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold">Review workspace</h3>
                <span className={`text-xs ${theme.muted}`}>Sample preview</span>
              </div>

              <div className="mt-4 flex gap-2">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "signals", label: "Signals" },
                  { id: "evidence", label: "Evidence" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDemoTab(tab.id)}
                    className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition sm:px-3 ${
                      demoTab === tab.id
                        ? "bg-violet-600 text-white"
                        : lightMode
                          ? "bg-violet-50 text-slate-600 hover:bg-violet-100"
                          : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className={`mt-4 rounded-xl p-4 ${theme.soft}`}>
                {demoTab === "overview" && (
                  <>
                    <p className="text-sm font-semibold">Start with the details</p>
                    <p className={`mt-2 text-xs leading-6 ${theme.muted}`}>
                      Review the opportunity description, employer information,
                      and application process before making a decision.
                    </p>
                  </>
                )}
                {demoTab === "signals" && (
                  <>
                    <p className="text-sm font-semibold">Warning indicators</p>
                    <div className="mt-3 space-y-3 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className={theme.muted}>Unexpected payment request</span>
                        <span className="text-amber-500">Review</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className={theme.muted}>Unverified company claim</span>
                        <span className="text-amber-500">Check</span>
                      </div>
                    </div>
                  </>
                )}
                {demoTab === "evidence" && (
                  <>
                    <p className="text-sm font-semibold">Evidence matters</p>
                    <p className={`mt-2 text-xs leading-6 ${theme.muted}`}>
                      Compare claims with reliable sources. Missing information
                      is not, by itself, proof of fraud.
                    </p>
                  </>
                )}
              </div>
            </div>

            <p className={`mt-4 text-center text-[10px] leading-5 ${theme.muted}`}>
              DEMONSTRATION ONLY · No live analysis has been performed
            </p>
          </div>
        </div>
      </section>

      {/* Principles strip */}
      <section className={`relative border-y ${theme.footer}`}>
        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-12">
          {[
            {
              icon: "⌕",
              title: "Investigate the details",
              text: "Look beyond an attractive offer.",
            },
            {
              icon: "◈",
              title: "Understand the evidence",
              text: "Know what supports each finding.",
            },
            {
              icon: "⛨",
              title: "Decide with confidence",
              text: "Use insights to guide your next steps.",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-xl text-violet-500">
                {item.icon}
              </div>
              <div>
                <h2 className="text-sm font-bold">{item.title}</h2>
                <p className={`mt-1 text-xs leading-5 ${theme.muted}`}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative mx-auto max-w-[1440px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.22em] text-violet-500">
              BUILT AROUND YOUR DECISIONS
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              More context.
              <span className="block text-violet-500">Fewer blind spots.</span>
            </h2>
          </div>
          <p className={`max-w-md text-sm leading-7 sm:text-base ${theme.muted}`}>
            A practical workflow for examining internship opportunities,
            understanding warning signs, and organizing supporting evidence.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.number}
              className={`group relative overflow-hidden rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 ${
                lightMode
                  ? "border-violet-100 bg-white hover:shadow-xl hover:shadow-violet-100"
                  : "border-white/10 bg-[#101426] hover:bg-[#13182D]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-2xl text-violet-500">
                  {feature.icon}
                </span>
                <span className={`text-sm font-semibold ${theme.muted}`}>
                  {feature.number}
                </span>
              </div>

              <p className="mt-7 text-[10px] font-bold tracking-[0.15em] text-violet-500">
                {feature.tag}
              </p>
              <h3 className="mt-3 text-lg font-bold">{feature.title}</h3>
              <p className={`mt-3 text-sm leading-7 ${theme.muted}`}>
                {feature.description}
              </p>

              <div className="mt-6 h-1 w-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300 group-hover:w-20" />
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 px-5 py-3 text-sm font-semibold text-violet-500 transition hover:bg-violet-500/10"
          >
            Open verification workspace <span>→</span>
          </Link>
        </div>
      </section>

      {/* Workflow */}
      <section
        id="how-it-works"
        className={`relative scroll-mt-24 border-y ${theme.footer} ${theme.soft}`}
      >
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.22em] text-violet-500">
              A CLEARER PROCESS
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Three steps.
              <span className="block text-violet-500">One smarter decision.</span>
            </h2>
            <p className={`mt-5 text-sm leading-7 sm:text-base ${theme.muted}`}>
              Understand the opportunity before deciding whether it deserves
              your time, trust, and personal information.
            </p>
          </div>

          <div className="relative mt-14 grid gap-5 md:grid-cols-3">
            {workflow.map((step, index) => (
              <article
                key={step.number}
                className={`relative rounded-2xl border p-7 ${
                  lightMode
                    ? "border-violet-100 bg-white"
                    : "border-white/10 bg-[#101426]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold tracking-tighter text-violet-500/70">
                    {step.number}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-500">
                    {index === 0 ? "↗" : index === 1 ? "⌕" : "✓"}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-bold">{step.title}</h3>
                <p className={`mt-4 text-sm leading-7 ${theme.muted}`}>
                  {step.description}
                </p>
                {index < 2 && (
                  <div className="absolute -right-3 top-12 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500 text-white md:flex">
                    →
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/verify"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-semibold text-white transition hover:bg-violet-500"
            >
              Start your review <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Security */}
      <section
        id="security"
        className="relative mx-auto max-w-[1440px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
      >
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-violet-500">
              TRUST BY DESIGN
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Security should be
              <span className="block text-violet-500">part of the product.</span>
            </h2>
            <p className={`mt-6 text-sm leading-8 sm:text-base ${theme.muted}`}>
              A trustworthy platform needs more than a polished interface.
              Access controls, careful input handling, privacy safeguards,
              and accountability all matter.
            </p>

            <div
              className={`mt-8 rounded-2xl border p-5 ${
                lightMode
                  ? "border-amber-200 bg-amber-50"
                  : "border-amber-400/15 bg-amber-400/[0.05]"
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-bold text-amber-600">
                <span>ⓘ</span> Transparent by design
              </p>
              <p className={`mt-2 text-xs leading-6 ${theme.muted}`}>
                These are platform security goals, not a claim that every
                protection is already deployed. Production security must be
                implemented and tested.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {securityItems.map((item) => (
              <article
                key={item.title}
                className={`rounded-2xl border p-6 transition hover:border-violet-500/40 ${
                  lightMode
                    ? "border-violet-100 bg-white"
                    : "border-white/10 bg-[#101426]"
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-xl text-violet-500">
                  {item.icon}
                </span>
                <h3 className="mt-5 font-bold">{item.title}</h3>
                <p className={`mt-3 text-sm leading-7 ${theme.muted}`}>
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact call to action */}
      <section className="relative mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
        <div className="relative overflow-hidden rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-700/20 via-violet-600/10 to-cyan-500/[0.08] p-7 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-violet-500/20 blur-[100px]" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.22em] text-violet-500">
                LET'S BUILD A SAFER EXPERIENCE
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                Have an idea?
                <span className="block text-violet-500">Let's talk.</span>
              </h2>
              <p className={`mt-5 max-w-xl text-sm leading-7 sm:text-base ${theme.muted}`}>
                Feedback and fresh perspectives help make InternShield AI
                better. Connect with the project team or explore the
                development repository.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-violet-600 px-6 py-4 font-semibold text-white transition hover:bg-violet-500"
              >
                Contact ByteSentinels <span>↗</span>
              </Link>
              <a
                href="https://github.com/KushagraTechie/internshield-ai"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-3 rounded-xl border px-6 py-4 font-semibold transition hover:border-violet-500 ${
                  lightMode
                    ? "border-violet-200 hover:bg-violet-50"
                    : "border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                Explore on GitHub <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative border-t ${theme.footer}`}>
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="InternShield logo"
                  width={48}
                  height={48}
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
              <p className={`mt-5 max-w-sm text-sm leading-7 ${theme.muted}`}>
                Helping students review internship opportunities through
                evidence-focused analysis and clearer explanations.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold">Explore</h3>
              <div className={`mt-4 flex flex-col gap-3 text-sm ${theme.muted}`}>
                <Link href="#features" className="transition hover:text-violet-500">
                  Features
                </Link>
                <Link href="#how-it-works" className="transition hover:text-violet-500">
                  How it works
                </Link>
                <Link href="#security" className="transition hover:text-violet-500">
                  Security
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Your account</h3>
              <div className={`mt-4 flex flex-col gap-3 text-sm ${theme.muted}`}>
                <Link href="/login" className="transition hover:text-violet-500">
                  Log in
                </Link>
                <Link href="/signup" className="transition hover:text-violet-500">
                  Create account
                </Link>
                <Link href="/verify" className="transition hover:text-violet-500">
                  Verification
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Connect</h3>
              <div className={`mt-4 flex flex-col gap-3 text-sm ${theme.muted}`}>
                <Link href="/contact" className="transition hover:text-violet-500">
                  Contact us
                </Link>
                <a
                  href="mailto:kushagrabajpai2007@gmail.com"
                  className="break-all transition hover:text-violet-500"
                >
                  Email the team
                </a>
                <a
                  href="https://www.linkedin.com/in/kushagra-bajpai-180187320/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-violet-500"
                >
                  LinkedIn ↗
                </a>
                <a
                  href="https://github.com/KushagraTechie/internshield-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-violet-500"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>

          <div
            className={`mt-10 flex flex-col gap-3 border-t pt-6 text-xs ${theme.footer} ${theme.muted} sm:flex-row sm:items-center sm:justify-between`}
          >
            <p>© 2026 ByteSentinels · InternShield AI</p>
            <p className="max-w-2xl leading-5">
              Informational tool only. Risk indicators are not definitive
              proof of fraud. Always independently verify important claims.
            </p>
            <Link href="/contact" className="shrink-0 transition hover:text-violet-500">
              Get in touch →
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
