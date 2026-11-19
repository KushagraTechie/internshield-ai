
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all the required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match. Please try again.");
      return;
    }

    if (!agreed) {
      setError("Please accept the acknowledgement to continue.");
      return;
    }

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(credential.user, {
        displayName: name.trim(),
      });

      try {
        await sendEmailVerification(credential.user);
      } catch {
        // The verification page offers a resend action without blocking signup.
      }
      router.replace("/verify-email");
    } catch (err: unknown) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof err.code === "string"
          ? err.code
          : "";

      switch (code) {
        case "auth/email-already-in-use":
          setError(
            "An account already exists with this email. Please log in instead."
          );
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError(
            "Please choose a stronger password with at least 8 characters."
          );
          break;
        case "auth/operation-not-allowed":
          setError(
            "Email/password registration is disabled in Firebase Authentication."
          );
          break;
        case "auth/network-request-failed":
          setError(
            "Network error. Check your internet connection and try again."
          );
          break;
        default:
          setError(
            "We couldn't create your account. Please check your Firebase configuration and try again."
          );
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#090D1A] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B16] px-4 py-8 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#101426]/95 shadow-2xl shadow-violet-950/30 md:grid-cols-2">
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
              <p className="text-lg font-bold">
                InternShield <span className="text-violet-400">AI</span>
              </p>
              <p className="text-xs text-slate-400">by ByteSentinels</p>
            </div>
          </Link>

          <div className="py-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-3xl text-cyan-300">
              ✦
            </div>

            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
              Make your next move.
              <span className="mt-3 block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                With more confidence.
              </span>
            </h1>

            <p className="mt-6 max-w-sm leading-8 text-slate-400">
              Create an account to organize your internship research and
              access platform features as they become available.
            </p>

            <div className="mt-8 space-y-3 text-sm text-slate-300">
              <p>✓ Keep your research organized</p>
              <p>✓ Review evidence and risk indicators</p>
              <p>✓ Make informed career decisions</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Built for clearer, safer career decisions.
          </p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <Link href="/" className="mb-7 flex items-center gap-3 md:hidden">
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

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Join the platform
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Create your account
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Start building a more informed internship search.
          </p>

          <form onSubmit={handleSignup} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
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
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Create password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="At least 8 characters"
                  className={`${inputClass} pr-20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Re-enter your password"
                  className={`${inputClass} pr-20`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm leading-6 text-slate-400">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => {
                  setAgreed(event.target.checked);
                  setError("");
                }}
                className="mt-1 accent-violet-500"
              />
              <span>
                I understand that internship risk assessments are informational
                and are not definitive proof of fraud.
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-300"
              >
                {error}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-violet-400 hover:text-violet-300"
            >
              Log in
            </Link>
          </p>

          <div className="mt-7 border-t border-white/10 pt-5 text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to homepage
            </Link>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-600">
            Your account is managed by Firebase Authentication.
          </p>
        </section>
      </div>
    </main>
  );
}
