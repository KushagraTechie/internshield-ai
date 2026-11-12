
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export default function VerifyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setCheckingAuth(false);

      if (!user) {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      alert("Unable to log out. Please try again.");
    }
  }

  if (checkingAuth || !authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B16] px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
          <p className="mt-4 text-sm text-slate-400">
            Verifying your session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="fixed right-5 top-5 z-50 rounded-lg border border-white/10 bg-[#151827] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:border-violet-500 hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>

      {children}
    </>  

  );
}

 