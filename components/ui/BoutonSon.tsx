"use client";

import { usePrefs } from "../PrefsProvider";

/** Petite onde sonore, toujours visible. Elle s'anime quand le son est actif. */
export function BoutonSon() {
  const { sound, setSound } = usePrefs();
  const hauteurs = [8, 16, 11, 20, 9];

  return (
    <button
      type="button"
      onClick={() => setSound(!sound)}
      aria-pressed={sound}
      aria-label={sound ? "Couper le son" : "Activer le son"}
      title={sound ? "Couper le son" : "Activer le son"}
      className="fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ink/30 bg-white text-ink transition-colors hover:bg-ink hover:text-white"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        {hauteurs.map((h, i) => (
          <rect
            key={i}
            x={3 + i * 4}
            y={12 - (sound ? h : 3) / 2}
            width="2"
            height={sound ? h : 3}
            rx="1"
            fill="currentColor"
            className={sound ? "onde-barre" : undefined}
            style={sound ? { animationDelay: `${i * 0.12}s` } : undefined}
          />
        ))}
        {!sound && <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      </svg>
      <style>{`
        .onde-barre { transform-box: fill-box; transform-origin: center; animation: onde 0.9s ease-in-out infinite alternate; }
        @keyframes onde { from { transform: scaleY(0.45); } to { transform: scaleY(1.15); } }
      `}</style>
    </button>
  );
}
