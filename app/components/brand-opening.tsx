"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export default function BrandOpening({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const showTimer = window.setTimeout(() => { setVisible(true); setUnlocked(false); }, 0);
    const unlockTimer = window.setTimeout(() => setUnlocked(true), reducedMotion ? 0 : 930);
    const closeTimer = window.setTimeout(() => setVisible(false), reducedMotion ? 70 : 2260);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(unlockTimer);
      window.clearTimeout(closeTimer);
    };
  }, [pathname]);

  return (
    <>
      {children}
      {visible && pathname === "/" && (
        <div className={`brand-opening${unlocked ? " is-unlocked" : ""}`} role="status" aria-live="polite" aria-label={unlocked ? "InternShield workspace unlocked" : "Opening InternShield workspace"}>
          <div className="brand-opening__grain" aria-hidden="true" />
          <div className="brand-opening__content">
            <div className="brand-opening__mark">
              <div className="brand-opening__orbit brand-opening__orbit--outer" />
              <div className="brand-opening__orbit brand-opening__orbit--inner" />
              <div className="brand-opening__halo" />
              <Image src="/logo.png" alt="" width={144} height={144} priority className="brand-opening__logo" />
              <div className="brand-opening__lock" aria-hidden="true">
                <svg viewBox="0 0 24 26" fill="none">
                  <rect x="4" y="11" width="16" height="12" rx="3" className="brand-opening__lock-body" />
                  <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" className="brand-opening__lock-shackle" />
                  <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0v1" className="brand-opening__lock-shackle-open" />
                  <circle cx="12" cy="16" r="1.25" className="brand-opening__lock-keyhole" />
                  <path d="M12 17.2v2" className="brand-opening__lock-keyhole" />
                </svg>
              </div>
              <span className="brand-opening__spark brand-opening__spark--one" />
              <span className="brand-opening__spark brand-opening__spark--two" />
              <span className="brand-opening__spark brand-opening__spark--three" />
            </div>

            <div className="brand-opening__wordmark">
              <p className="brand-opening__eyebrow">BYTESENTINELS · TRUSTED OPPORTUNITIES</p>
              <h1>InternShield <span>AI</span></h1>
              <p className="brand-opening__caption">Your workspace, secured.</p>
            </div>

            <div className="brand-opening__progress" aria-hidden="true"><span /></div>
            <div className="brand-opening__status">
              <span className="brand-opening__status-dot" />
              {unlocked ? "WORKSPACE UNLOCKED" : "VERIFYING SECURE ACCESS"}
            </div>
          </div>
          <span className="brand-opening__corner brand-opening__corner--tl" aria-hidden="true" />
          <span className="brand-opening__corner brand-opening__corner--br" aria-hidden="true" />
        </div>
      )}
    </>
  );
}
