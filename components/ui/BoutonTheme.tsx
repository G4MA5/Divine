"use client";

import { usePrefs } from "../PrefsProvider";

/** Bascule clair / sombre, choix mémorisé. */
export function BoutonTheme() {
  const { theme, toggleTheme } = usePrefs();
  const sombre = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={sombre}
      aria-label={sombre ? "Passer en mode clair" : "Passer en mode sombre"}
      title={sombre ? "Mode clair" : "Mode sombre"}
      className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-accent/60 bg-bg/85 text-accent backdrop-blur transition-colors hover:bg-bg-deep"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        {sombre ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
          </>
        ) : (
          <path d="M20 14.2A8 8 0 0 1 9.8 4 8 8 0 1 0 20 14.2Z" />
        )}
      </svg>
    </button>
  );
}
