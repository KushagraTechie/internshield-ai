
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    // Temporary UI demonstration only.
    // Real authentication will be added with Firebase later.
    window.setTimeout(() => {
      setLoading(false);
      setError(
        "Authentication is not connected yet. We'll enable secure login when Firebase is configured."
      );
    }, 700);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B16] px-4 py-8 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#101426]/95 shadow-2xl shadow-violet-950/30 md:grid-cols-2">
        {/* Left branding panel */}
        <section className="hidden flex-col justify-between border-r border-white/10 p-10 md:flex lg:p-14">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="InternShield logo"
              width={60}
              height={60}
              priority
              className="h-14 w-14 object-contain"
            />
            <div>
              <p className="text-lg font-bold tracking-tight">
                InternShield <span className="text-violet-400">AI</span>
              </p>
              <p className="text-xs text-slate-400">by ByteSentinels</p>
            </div>
          </Link>

          <div className="py-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-3xl text-violet-300">
              ✳
            </div>

            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
              Welcome back.
              <span className="mt-3 block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Your next step starts here.
              </span>
            </h1>

            <p className="mt-6 max-w-sm text-base leading-8 text-slate-400">
              Return to your workspace and keep your internship research
              organized in one place.
            </p>

            <div className="mt-8 space-y-3 text-sm text-slate-300">
              <p>✓ Evidence-focused insights</p>
              <p>✓ Privacy-conscious design</p>
              <p>✓ Clear, transparent analysis</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            A safer search starts with informed decisions.
          </p>
        </section>

        {/* Login form */}
        <section className="p-6 sm:p-10 lg:p-14">
          <Link href="/" className="mb-8 flex items-center gap-3 md:hidden">
            <Image
              src="/logo.png"
              alt="InternShield logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="font-bold">
                InternShield <span className="text-violet-400">AI</span>
              </p>
              <p className="text-xs text-slate-400">by ByteSentinels</p>
            </div>
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Your workspace
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Log in to your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Welcome back! Enter your details to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#090D1A] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-200"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password recovery will be available after Firebase authentication is connected."
                    )
                  }
                  className="text-xs text-violet-400 transition hover:text-violet-300"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-[#090D1A] px-4 py-3.5 pr-20 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-300"
              >
                <span className="mt-0.5" aria-hidden="true">
                  !
                </span>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Checking details...
                </>
              ) : (
                <>Log in <span aria-hidden="true">→</span></>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">NEW HERE?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-violet-400 transition hover:text-violet-300"
            >
              Create an account
            </Link>
          </p>

          <div className="mt-8 border-t border-white/10 pt-5 text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to homepage
            </Link>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-600">
            Protected access is coming soon. Authentication is not yet enabled.
          </p>
        </section>
      </div>
    </main>
  );
}
