
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

type RiskLevel = "low" | "moderate" | "elevated";

function getRiskLevel(count: number): RiskLevel {
  if (count >= 3) return "elevated";
  if (count >= 1) return "moderate";
  return "low";
}

export default function VerifyPage() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  const riskLevel = getRiskLevel(selectedWarnings.length);

  const theme = lightMode
    ? {
        page: "bg-[#F8F8FF] text-[#17172A]",
        card: "border-violet-950/10 bg-white",
        muted: "text-slate-600",
        input: "border-violet-950/10 bg-white",
        soft: "bg-violet-50",
        footer: "border-violet-950/10",
      }
    : {
        page: "bg-[#080B16] text-white",
        card: "border-white/10 bg-[#101426]",
        muted: "text-slate-400",
        input: "border-white/10 bg-[#090D1A]",
        soft: "bg-white/[0.035]",
        footer: "border-white/10",
      };

  const inputClass =
    `w-full rounded-xl border ${theme.input} px-4 py-3.5 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20`;

  function toggleWarning(id: string) {
    setSelectedWarnings((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
    setReview(false);
    setError("");
  }

  function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReview(false);

    if (!company.trim() || !role.trim() || !description.trim()) {
      setError(
        "Please enter the company name, internship role, and opportunity description."
      );
      return;
    }

    if (url.trim()) {
      try {
        const parsed = new URL(url.trim());
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          setError("Please enter a valid HTTP or HTTPS application URL.");
          return;
        }
      } catch {
        setError("Please enter a valid application URL, or leave it blank.");
        return;
      }
    }

    setReview(true);
  }

  const riskStyle = {
    low: {
      label: "Few warning signs selected",
      color: "text-emerald-400",
      bar: "bg-emerald-500",
      width: "20%",
      description:
        "You did not select any listed warning signs. This does not establish that the opportunity is legitimate.",
    },
    moderate: {
      label: "Some warning signs selected",
      color: "text-amber-400",
      bar: "bg-amber-500",
      width: "55%",
      description:
        "One or two warning signs were selected. Investigate them and seek reliable supporting evidence before proceeding.",
    },
    elevated: {
      label: "Several warning signs selected",
      color: "text-rose-400",
      bar: "bg-rose-500",
      width: "90%",
      description:
        "Several warning signs were selected. Pause before sharing sensitive information or making payments, and independently verify the claims.",
    },
  }[riskLevel];

  return (
    <main className={`relative min-h-screen overflow-hidden ${theme.page}`}>
      <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-violet-700/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 top-[600px] h-96 w-96 rounded-full bg-cyan-600/10 blur-[130px]" />

      {/* Navigation */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
          lightMode
            ? "border-violet-950/10 bg-white/85"
            : "border-white/10 bg-[#080B16]/85"
        }`}
      >
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
              className={`hidden text-sm transition hover:text-violet-500 sm:inline ${
                theme.muted
              }`}
            >
              Contact
            </Link>
            <button
              type="button"
              onClick={() => setLightMode(!lightMode)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                lightMode
                  ? "border-violet-200 bg-white"
                  : "border-white/10 bg-white/[0.04]"
              }`}
              aria-label="Toggle theme"
            >
              {lightMode ? "☾" : "☼"}
            </button>
            <Link
              href="/login"
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        {/* Page introduction */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-violet-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            INTERNSHIP REVIEW WORKSPACE
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Look closer.
            <span className="block bg-gradient-to-r from-violet-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Decide smarter.
            </span>
          </h1>

          <p className={`mt-5 max-w-2xl text-base leading-8 ${theme.muted}`}>
            Enter the details of an internship opportunity, flag anything
            concerning, and organize the information you need to investigate
            before making a decision.
          </p>
        </div>

        {/* Main workspace */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className={`rounded-3xl border p-5 sm:p-8 ${theme.card}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-violet-500">
                  STEP 01
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  Opportunity details
                </h2>
                <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                  Add the information supplied by the employer.
                </p>
              </div>
              <span className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-500">
                Review form
              </span>
            </div>

            <form onSubmit={handleReview} className="mt-7 space-y-5" noValidate>
              <div>
                <label htmlFor="company" className="mb-2 block text-sm font-medium">
                  Company or organization *
                </label>
                <input
                  id="company"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    setReview(false);
                    setError("");
                  }}
                  placeholder="e.g. Example Technologies"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="role" className="mb-2 block text-sm font-medium">
                  Internship role *
                </label>
                <input
                  id="role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setReview(false);
                    setError("");
                  }}
                  placeholder="e.g. Frontend Developer Intern"
                  className={inputClass}
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
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setReview(false);
                    setError("");
                  }}
                  placeholder="https://example.com/careers"
                  className={inputClass}
                />
                <p className={`mt-2 text-xs ${theme.muted}`}>
                  Optional. This demo does not open or scan the URL.
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Internship description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setReview(false);
                    setError("");
                  }}
                  rows={5}
                  maxLength={5000}
                  placeholder="Paste the internship description, responsibilities, compensation details, and any requests from the recruiter..."
                  className={`${inputClass} resize-y`}
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
                  Select anything you have observed. Leave items unchecked if
                  you have no evidence of them.
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
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-400"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-violet-600 px-5 py-4 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
              >
                Generate review summary <span>→</span>
              </button>

              <p className={`text-center text-xs leading-5 ${theme.muted}`}>
                This prototype performs a local checklist review only. It does
                not contact an AI model, verify the employer, or scan external
                websites.
              </p>
            </form>
          </section>

          {/* Summary panel */}
          <aside className="space-y-6">
            <section className={`rounded-3xl border p-6 sm:p-8 ${theme.card}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-violet-500">
                    LIVE CHECKLIST
                  </p>
                  <h2 className="mt-2 text-xl font-bold">Review overview</h2>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-500">
                  ◈
                </span>
              </div>

              <div className={`mt-6 rounded-2xl border p-5 ${theme.soft}`}>
                <p className={`text-sm ${theme.muted}`}>Warning signs selected</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-4xl font-bold tabular-nums">
                    {selectedWarnings.length}
                    <span className={`ml-2 text-base font-normal ${theme.muted}`}>
                      / {warningOptions.length}
                    </span>
                  </p>
                  <span className={`text-xs font-semibold ${riskStyle.color}`}>
                    {riskStyle.label}
                  </span>
                </div>

                <div className={`mt-5 h-2 overflow-hidden rounded-full ${lightMode ? "bg-violet-100" : "bg-white/10"}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${riskStyle.bar}`}
                    style={{ width: riskStyle.width }}
                  />
                </div>

                <p className={`mt-4 text-sm leading-7 ${theme.muted}`}>
                  {riskStyle.description}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className={`flex items-start justify-between gap-4 border-b pb-4 ${theme.footer}`}>
                  <span className={`text-sm ${theme.muted}`}>Company</span>
                  <span className="max-w-[65%] break-words text-right text-sm font-semibold">
                    {company.trim() || "Not provided"}
                  </span>
                </div>
                <div className={`flex items-start justify-between gap-4 border-b pb-4 ${theme.footer}`}>
                  <span className={`text-sm ${theme.muted}`}>Role</span>
                  <span className="max-w-[65%] break-words text-right text-sm font-semibold">
                    {role.trim() || "Not provided"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className={`text-sm ${theme.muted}`}>Description</span>
                  <span className="text-right text-sm font-semibold">
                    {description.trim() ? "Provided" : "Not provided"}
                  </span>
                </div>
              </div>

              {review && (
                <div
                  role="status"
                  className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4"
                >
                  <p className="font-semibold text-emerald-500">
                    ✓ Review summary generated
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                    Your checklist responses have been summarized locally.
                    Investigate each concern and verify important claims
                    independently.
                  </p>
                </div>
              )}
            </section>

            <section
              className={`rounded-3xl border p-6 sm:p-8 ${
                lightMode
                  ? "border-amber-200 bg-amber-50"
                  : "border-amber-400/15 bg-amber-400/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-500">
                  !
                </span>
                <h3 className="font-bold">Before you proceed</h3>
              </div>
              <ul className={`mt-4 space-y-3 text-sm leading-6 ${theme.muted}`}>
                <li>• Never pay to secure an internship without independent verification.</li>
                <li>• Do not share passwords, OTPs, or unnecessary sensitive data.</li>
                <li>• Verify the employer using trusted, independently located sources.</li>
                <li>• Remember that a checklist is not proof of fraud or legitimacy.</li>
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
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span>
              <span className="font-semibold">InternShield AI</span> by ByteSentinels
            </span>
          </Link>
          <div className="flex flex-wrap gap-5">
            <Link href="/" className="hover:text-violet-500">Home</Link>
            <Link href="/login" className="hover:text-violet-500">Log in</Link>
            <Link href="/signup" className="hover:text-violet-500">Sign up</Link>
            <Link href="/contact" className="hover:text-violet-500">Contact</Link>
          </div>
          <p>Illustrative checklist · Not a fraud determination</p>
        </footer>
      </div>
    </main>
  );
}
