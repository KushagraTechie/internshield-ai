"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, updatePassword, updateProfile, verifyBeforeUpdateEmail } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { auth, storage } from "@/app/lib/firebase";
import { useWorkspaceTheme } from "@/app/components/theme-provider";

function friendlyError(error: unknown, fallback: string) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code === "auth/requires-recent-login") return "For security, sign in again and retry this change.";
  if (code === "auth/weak-password") return "Choose a password with at least 8 characters.";
  if (code === "auth/email-already-in-use") return "That email is already linked to another account.";
  if (code === "storage/bucket-not-found") return "Profile photos are not enabled for this Firebase project yet. In Firebase Console, open Storage, create the project's storage bucket, then publish the included storage.rules file.";
  if (code.startsWith("storage/unauthorized")) return "Firebase Storage rules blocked this upload. Publish the included storage.rules file in Firebase Console → Storage → Rules.";
  if (code === "storage/retry-limit-exceeded") return "The photo upload timed out. Check that Firebase Storage is enabled and try again.";
  if (code.startsWith("storage/") || code === "storage/object-not-found") return "Profile photo upload isn't available yet. Enable Firebase Storage and publish the included storage rules.";
  return fallback;
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useWorkspaceTheme();
  const dark = theme === "dark";
  const [user, setUser] = useState(auth.currentUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, (activeUser) => {
    if (!activeUser) { router.replace("/login?next=/settings"); return; }
    setUser(activeUser); setName(activeUser.displayName ?? ""); setEmail(activeUser.email ?? ""); setPhoto(activeUser.photoURL); setLoading(false);
  }), [router]);

  const panel = dark ? "border-[#303a34] bg-[#171e1a]" : "border-[#dedfd5] bg-[#fbfaf5]";
  const muted = dark ? "text-[#a4aca3]" : "text-[#687168]";
  const input = `mt-2 w-full border px-4 py-3 outline-none transition focus:border-[#789064] focus:ring-1 focus:ring-[#789064]/30 ${dark ? "border-[#303a34] bg-[#141b16] text-white placeholder:text-[#798178]" : "border-[#d8d9cf] bg-[#fbfaf5] text-[#20251f] placeholder:text-[#8b9085]"}`;

  async function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { setError("Choose a PNG, JPG, or WebP image."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Profile photos must be smaller than 5 MB."); return; }
    const previousPhoto = photo;
    const previewUrl = URL.createObjectURL(file);
    setPhoto(previewUrl);
    setUploading(true); setUploadProgress(0); setError(""); setMessage("");
    try {
      const imageRef = ref(storage, `avatars/${user.uid}/profile`);
      const task = uploadBytesResumable(imageRef, file, { contentType: file.type, cacheControl: "private,max-age=3600" });
      await new Promise<void>((resolve, reject) => {
        let unsubscribe = () => {};
        const timeout = window.setTimeout(() => { task.cancel(); reject(new Error("storage/retry-limit-exceeded")); }, 45_000);
        unsubscribe = task.on("state_changed", (snapshot) => {
          setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }, (taskError) => { window.clearTimeout(timeout); unsubscribe(); reject(taskError); }, () => { window.clearTimeout(timeout); unsubscribe(); resolve(); });
      });
      const url = await getDownloadURL(imageRef);
      await updateProfile(user, { photoURL: url });
      setPhoto(url); setMessage("Profile photo updated.");
    } catch (uploadError) { setPhoto(previousPhoto); setError(friendlyError(uploadError, "We couldn't upload your photo. Please try again.")); }
    finally { URL.revokeObjectURL(previewUrl); setUploading(false); setUploadProgress(0); }
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (!name.trim()) { setError("Your name can't be empty."); return; }
    setSaving(true); setError(""); setMessage("");
    try { await updateProfile(user, { displayName: name.trim() }); setMessage("Your profile name is updated."); }
    catch (saveError) { setError(friendlyError(saveError, "We couldn't update your name.")); }
    finally { setSaving(false); }
  }

  async function changeAccountEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) { setError("Enter a valid email address."); return; }
    setSaving(true); setError(""); setMessage("");
    try { await verifyBeforeUpdateEmail(user, newEmail.trim()); setMessage("Firebase sent a confirmation link to your new email. Your account changes after you confirm it."); setNewEmail(""); }
    catch (emailError) { setError(friendlyError(emailError, "We couldn't start the email change. Sign in again and retry.")); }
    finally { setSaving(false); }
  }

  async function changeAccountPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.email) return setError("Password changes are supported for email and password accounts.");
    if (newPassword.length < 8) return setError("Choose a new password with at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("The new passwords don't match.");
    setSaving(true); setError(""); setMessage("");
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setMessage("Your password has been changed.");
    } catch (passwordError) { setError(friendlyError(passwordError, "We couldn't change your password. Check your current password and retry.")); }
    finally { setSaving(false); }
  }

  async function resendVerification() {
    if (!user) return;
    setSaving(true); setError(""); setMessage("");
    try { await sendEmailVerification(user); setMessage(`Verification email sent to ${user.email}.`); }
    catch (verificationError) { setError(friendlyError(verificationError, "Firebase couldn't send the verification email. Try again later.")); }
    finally { setSaving(false); }
  }

  if (loading) return <main className={`flex min-h-screen items-center justify-center ${dark ? "bg-[#080B14] text-white" : "bg-[#F5F6FA] text-slate-900"}`}><p className="text-sm">Loading your account…</p></main>;

  return (
    <main className={`workspace-page min-h-screen transition-colors duration-300 ${dark ? "bg-[#101612] text-[#f1f0e9]" : "bg-[#f2f1e9] text-[#20251f]"}`}>
      <header className={`sticky top-0 z-20 border-b ${dark ? "border-[#303a34] bg-[#141b16]" : "border-[#d8d9cf] bg-[#f2f1e9]"}`}><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4"><div><Link href="/dashboard" className={`text-xs font-semibold ${muted}`}>← Workspace</Link><h1 className="mt-1 font-serif text-2xl">Account settings</h1></div><div className="flex gap-2"><button type="button" onClick={toggleTheme} className={`border px-3 py-2 text-sm ${dark ? "border-[#303a34]" : "border-[#d8d9cf]"}`}>{dark ? "☼ Light" : "☾ Dark"}</button><Link href="/history" className={`border px-3 py-2 text-sm font-semibold ${dark ? "border-[#303a34]" : "border-[#d8d9cf]"}`}>My reports</Link></div></div></header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <div className="mb-7"><p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#748a5e]">ACCOUNT · PREFERENCES</p><h2 className="mt-2 font-serif text-3xl font-medium tracking-tight">Make the workspace yours.</h2><p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>Update the details students use to sign in and receive saved internship reports.</p></div>
        {message && <p role="status" className={`mb-5 rounded-xl border p-4 text-sm ${dark ? "border-emerald-300/15 bg-emerald-400/[0.07] text-emerald-200" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{message}</p>}
        {error && <p role="alert" className={`mb-5 rounded-xl border p-4 text-sm ${dark ? "border-rose-300/15 bg-rose-400/[0.07] text-rose-200" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{error}</p>}
        <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <section className={`h-fit rounded-3xl border p-6 sm:p-7 ${panel}`}><p className="text-[10px] font-bold tracking-[0.2em] text-[#748a5e]">PROFILE</p><div className="mt-6 flex items-center gap-4"><div aria-label={name ? `${name}'s profile photo` : "Profile photo"} role="img" className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-[#789064]/30 bg-[#3b5b43] text-3xl font-bold text-white" style={photo ? { backgroundImage: `url("${photo.replaceAll('"', '%22')}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{photo ? "" : (name.charAt(0).toUpperCase() || "S")}</div><div className="min-w-0"><p className="truncate text-lg font-bold">{name || "Student"}</p><p className={`mt-1 break-all text-sm ${muted}`}>{email}</p></div></div><label className={`mt-6 flex cursor-pointer items-center justify-center rounded-xl border border-dashed px-4 py-3 text-sm font-semibold transition ${dark ? "border-white/15 hover:border-violet-300/40 hover:bg-white/[0.03]" : "border-slate-300 hover:border-violet-400 hover:bg-violet-50"}`}><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void changePhoto(event)} disabled={uploading} />{uploading ? `Uploading photo… ${uploadProgress}%` : photo ? "Change profile photo" : "Upload a profile photo"}</label><p className={`mt-2 text-center text-xs leading-5 ${muted}`}>PNG, JPG, or WebP · up to 5 MB</p><div className={`mt-6 rounded-2xl border p-4 ${dark ? "border-white/[0.07] bg-white/[0.025]" : "border-slate-100 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">Email verification</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${user?.emailVerified ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>{user?.emailVerified ? "VERIFIED" : "NEEDS ACTION"}</span></div>{!user?.emailVerified && <button type="button" onClick={() => void resendVerification()} disabled={saving} className="mt-3 text-xs font-semibold text-[#748a5e]">Resend confirmation email →</button>}</div><div className={`mt-5 flex items-center justify-between gap-3 rounded-2xl border p-4 ${dark ? "border-white/[0.07]" : "border-slate-100"}`}><span><span className="block text-sm font-semibold">Appearance</span><span className={`mt-1 block text-xs ${muted}`}>Your choice follows you around the workspace</span></span><button type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} className={`rounded-xl px-3 py-2 text-sm ${dark ? "bg-white/[0.06]" : "bg-slate-100"}`}>{dark ? "☼" : "☾"} {dark ? "Dark" : "Light"}</button></div></section>

          <div className="space-y-5">
            <section className={`rounded-3xl border p-6 sm:p-7 ${panel}`}><p className="text-[10px] font-bold tracking-[0.2em] text-[#748a5e]">PERSONAL DETAILS</p><h3 className="mt-2 text-lg font-bold">Your name</h3><form onSubmit={(event) => void saveName(event)} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-medium">Display name<input className={input} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} /></label><button type="submit" disabled={saving} className="rounded-xl bg-[#3b5b43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2d4935] disabled:opacity-50">Save name</button></form></section>

            <section className={`rounded-3xl border p-6 sm:p-7 ${panel}`}><p className="text-[10px] font-bold tracking-[0.2em] text-[#748a5e]">SIGN-IN EMAIL</p><h3 className="mt-2 text-lg font-bold">Change your email address</h3><p className={`mt-1 text-sm ${muted}`}>Your account updates after you confirm the link Firebase sends to the new address.</p><p className={`mt-3 text-sm ${muted}`}>Current email: <strong className="break-all text-current">{email}</strong></p><form onSubmit={(event) => void changeAccountEmail(event)} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-medium">New email<input className={input} type="email" autoComplete="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="you@example.com" /></label><button type="submit" disabled={saving} className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${dark ? "border-white/10 hover:bg-white/[0.04]" : "border-slate-200 hover:bg-slate-50"}`}>Send confirmation</button></form></section>

            <section className={`rounded-3xl border p-6 sm:p-7 ${panel}`}><p className="text-[10px] font-bold tracking-[0.2em] text-[#748a5e]">ACCOUNT SECURITY</p><h3 className="mt-2 text-lg font-bold">Change your password</h3><p className={`mt-1 text-sm ${muted}`}>Confirm your current password first. Your new password must have at least 8 characters.</p><form onSubmit={(event) => void changeAccountPassword(event)} className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium sm:col-span-2">Current password<input className={input} type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label><label className="text-sm font-medium">New password<input className={input} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required /></label><label className="text-sm font-medium">Confirm new password<input className={input} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></label><div className="sm:col-span-2"><button type="submit" disabled={saving} className="rounded-xl bg-[#3b5b43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2d4935] disabled:opacity-50">Update password</button></div></form></section>
          </div>
        </div>
        <p className={`mt-7 text-xs leading-5 ${muted}`}>Profile photos use Firebase Storage. If the bucket is not enabled, create it and publish the included owner-only rules. Firebase may require a pay-as-you-go Blaze plan for Storage; review the billing terms before enabling it.</p>
      </div>
    </main>
  );
}
