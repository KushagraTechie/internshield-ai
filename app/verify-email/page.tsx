"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, reload, sendEmailVerification, signOut, type User } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [verifiedReady, setVerifiedReady] = useState(false);
  const [message, setMessage] = useState("");
  const processingUid = useRef<string | null>(null);

  const finishVerifiedAccount = useCallback(async (user: User) => {
    if (processingUid.current === user.uid) return;
    processingUid.current = user.uid;
    setBusy(true); setMessage("");
    try {
      await reload(user);
      const currentUser = auth.currentUser;
      if (!currentUser?.emailVerified) {
        setMessage("Open the latest verification link, then check again. If a previous link has expired or was already used, request a fresh one below.");
        return;
      }

      setVerifiedReady(true);
      setMessage("Your account is confirmed and ready to use.");
    } catch {
      if (auth.currentUser?.emailVerified) {
        setVerifiedReady(true);
        setMessage("Your account is confirmed and ready to use.");
      } else {
        setMessage("We couldn't refresh the account status just now. Open the latest link or request a fresh one below.");
      }
    } finally {
      processingUid.current = null;
      setBusy(false);
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.replace("/login");
      return;
    }
    setEmail(user.email ?? "your email address");
    setChecking(false);
    if (user.emailVerified) void finishVerifiedAccount(user);
  }), [finishVerifiedAccount, router]);

  async function checkVerification() {
    const user = auth.currentUser;
    if (!user) return router.replace("/login");
    await finishVerifiedAccount(user);
  }

  async function resend() {
    const user = auth.currentUser;
    if (!user) return router.replace("/login");
    setBusy(true); setMessage("");
    try {
      await sendEmailVerification(user);
      setMessage("A fresh verification link is on its way. Check your inbox and spam folder.");
    } catch {
      setMessage("If you don't see a fresh link, check your spam folder and try again in a moment.");
    } finally { setBusy(false); }
  }

  async function switchAccount() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b14] px-5 py-12 text-white">
      <div className="pointer-events-none absolute -left-32 top-16 h-96 w-96 rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
      <section className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#111522]/90 p-7 shadow-2xl shadow-black/40 sm:p-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image src="/logo.png" alt="InternShield logo" width={44} height={44} />
          <span className="font-bold">InternShield <span className="text-violet-400">AI</span></span>
        </Link>
        <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-2xl text-cyan-200">✉</div>
        <p className="mt-7 text-xs font-bold tracking-[0.22em] text-cyan-300">ONE QUICK ACCOUNT CHECK</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Confirm it’s really you.</h1>
        <p className="mt-4 leading-7 text-slate-300">Check <strong className="break-all text-white">{email || "your email"}</strong> for a verification link. If it hasn’t arrived or an earlier link has expired, request a fresh one below.</p>
        {message && <p role="status" className="mt-5 rounded-xl border border-violet-400/20 bg-violet-400/10 p-3 text-sm text-violet-100">{message}</p>}
        <button type="button" onClick={() => verifiedReady ? router.replace("/verify") : void checkVerification()} disabled={checking || busy} className="mt-7 w-full rounded-xl bg-violet-500 px-5 py-3.5 font-semibold transition hover:bg-violet-400 disabled:opacity-50">{busy ? "Checking your account…" : verifiedReady ? "Continue to your workspace" : "I've verified my email"}</button>
        {!verifiedReady && <button type="button" onClick={() => void resend()} disabled={checking || busy} className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-violet-300/50 hover:bg-white/[0.04] disabled:opacity-50">Resend verification link</button>}
        {!verifiedReady && <button type="button" onClick={() => void switchAccount()} className="mt-5 w-full text-sm text-slate-400 underline decoration-white/20 underline-offset-4 hover:text-white">Use a different account</button>}
        <p className="mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-slate-500">Can’t find it? Check spam or promotions. The link is sent by Firebase Authentication.</p>
      </section>
    </main>
  );
}
