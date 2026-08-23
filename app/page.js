"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    let cancelled = false;
    import("@/lib/engine").then((mod) => {
      if (!cancelled) mod.mount();
    });
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline app-shell caching is a nice-to-have — the app still
        // works without it as long as the page was loaded once.
      });
    }
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">KF</div>
            <div className="brand-text">
              <div className="brand-name">Karimu Field Audit</div>
              <div className="brand-sub" id="brandSub">Offline ready</div>
            </div>
          </div>
          <div className="topbar-spacer"></div>
          <button className="iconbtn" id="langBtn" title="Change language" aria-label="Change language">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.7 4 6.2 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6.2-4-9s1.5-6.3 4-9Z" />
            </svg>
            <span id="langLabel" className="lang-code">EN</span>
          </button>
          <button className="iconbtn" id="themeBtn" title="Switch theme" aria-label="Switch theme">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
          <button className="syncpill" id="syncPill">
            <span className="dot" id="netDot"></span>
            <span id="syncLabel">Sync</span>
          </button>
        </header>
        <main id="view"></main>
      </div>
      <div id="bottom"></div>
    </>
  );
}
