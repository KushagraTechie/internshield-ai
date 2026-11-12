
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// Use the same Firebase file path as your working signup page.
import { auth } from "@/app/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  function getErrorCode(err: unknown): string {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err
    ) {
      return String(err.code);
    }

    return "";
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);

      if (!credential.user.emailVerified) {
        try { await sendEmailVerification(credential.user); } catch { /* The verification page offers a safe resend action. */ }
        router.replace("/verify-email");
        return;
      }

      // Navigate only after Firebase confirms successful login.
      router.replace("/verify");
    } catch (err: unknown) {
      const code = getErrorCode(err);

      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Incorrect email or password. Please try again.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your internet connection.");
      } else if (code === "auth/operation-not-allowed") {
        setError(
          "Email/password sign-in is disabled in Firebase Console."
        );
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setError("");
    setSuccess("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address first.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, cleanEmail);

      setSuccess(
        "If the account is eligible, a password reset email will be sent. Check your inbox."
      );
    } catch (err: unknown) {
      const code = getErrorCode(err);

      if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(
          "Could not send the reset email. Please try again later."
        );
      }
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B16] px-4 py-8 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#101426]/95 shadow-2xl shadow-violet-950/30 md:grid-cols-2">
        {/* Branding panel */}
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
                  setSuccess("");
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
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="text-xs text-violet-400 transition hover:text-violet-300 disabled:opacity-60"
                >
                  {resetLoading ? "Sending..." : "Forgot password?"}
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
                    setSuccess("");
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-[#090D1A] px-4 py-3.5 pr-20 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
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
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-300"
              >
                {success}
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
                  Signing in...
                </>
              ) : (
                <>
                  Log in <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">NEW HERE?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
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

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Secure sign-in powered by Firebase Authentication.
          </p>
        </section>
      </div>
    </main>
  );
}
