"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { identite } from "@/content/identite";
import { projets } from "@/content/projets";

/** Date d'édition générée côté client (« Octobre 2026 »). */
function Edition() {
  const [d, setD] = useState("");
  useEffect(() => {
    const s = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    setD(s.charAt(0).toUpperCase() + s.slice(1));
  }, []);
  return (
    <span suppressHydrationWarning>
      {identite.numero} — {d || " "}
    </span>
  );
}

/** Silhouette de remplacement tant que le portrait n'est pas fourni. */
function PortraitDeSecours() {
  return (
    <svg viewBox="0 0 400 520" className="absolute bottom-0 left-1/2 h-full -translate-x-1/2" role="img" aria-label="Silhouette en attendant le portrait">
      <defs>
        <linearGradient id="sil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2420" />
          <stop offset="1" stopColor="#15120f" />
        </linearGradient>
      </defs>
      <path d="M0 520c8-110 60-150 130-168l50-14h40l50 14c70 18 122 58 130 168Z" fill="url(#sil)" />
      <rect x="168" y="262" width="64" height="80" rx="28" fill="#2a2420" />
      <ellipse cx="200" cy="190" rx="78" ry="96" fill="#2a2420" />
      <path d="M118 190c-10-84 36-132 82-132s92 48 82 132c-18-40-48-62-82-62s-64 22-82 62Z" fill="#15120f" />
    </svg>
  );
}

function CodeBarres() {
  const barres = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 3];
  let x = 0;
  return (
    <svg viewBox="0 0 70 34" aria-hidden="true" className="block w-full">
      <rect width="70" height="34" fill="#f4ede0" />
      {barres.map((w, i) => {
        const bx = 3 + x;
        x += w + 1.2;
        return i % 2 === 0 ? <rect key={i} x={bx} y="3" width={w} height="24" fill="#15120f" /> : null;
      })}
      <text x="35" y="32" textAnchor="middle" fontSize="3.6" fontFamily="monospace" fill="#15120f">
        0 01 2026 CV
      </text>
    </svg>
  );
}

/** Une de magazine. Toutes les dimensions sont en cqw : la couverture garde ses proportions à toute taille. */
export function Couverture() {
  const [portraitOk, setPortraitOk] = useState(true);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-paper text-ink"
      style={{ containerType: "inline-size", fontFamily: "var(--font-serif)" }}
    >
      {/* cadre intérieur, filet doré */}
      <div className="pointer-events-none absolute inset-[3.2cqw] z-[6] border border-gold/70" />

      {/* en-tête */}
      <div className="absolute inset-x-[6cqw] top-[5.2cqw] z-[5] flex justify-between font-sans uppercase tracking-[0.26em] text-ink/70" style={{ fontSize: "2.1cqw" }}>
        <Edition />
        <span>Le magazine de Divine</span>
      </div>

      {/* le titre, DERRIÈRE le portrait */}
      <h2
        className="absolute inset-x-0 top-[8cqw] z-[1] text-center font-display font-bold italic leading-none text-ink"
        style={{ fontSize: "12.6cqw", letterSpacing: "-0.035em" }}
      >
        {identite.magazine}
      </h2>

      {/* le portrait */}
      <div className="absolute bottom-0 left-1/2 z-[2] h-[104cqw] w-[84cqw] -translate-x-1/2">
        {portraitOk ? (
          <Image
            src={identite.portrait}
            alt="Portrait de Divine Graourou"
            fill
            sizes="(max-width: 768px) 90vw, 600px"
            className="object-contain object-bottom"
            priority
            onError={() => setPortraitOk(false)}
          />
        ) : (
          <PortraitDeSecours />
        )}
      </div>

      {/* accroches latérales */}
      <ul className="absolute left-[6cqw] top-[40cqw] z-[4] w-[26cqw] font-sans uppercase leading-snug" style={{ fontSize: "2.5cqw", letterSpacing: "0.14em" }}>
        {identite.accroches.map((a) => (
          <li key={a} className="mb-[3cqw] border-t border-gold pt-[1.2cqw]">
            {a}
          </li>
        ))}
      </ul>
      <ul className="absolute right-[6cqw] top-[40cqw] z-[4] w-[26cqw] text-right font-sans uppercase leading-snug" style={{ fontSize: "2.5cqw", letterSpacing: "0.14em" }}>
        <li className="mb-[3cqw] border-t border-gold pt-[1.2cqw]">{projets.length} projets à la une</li>
        <li className="mb-[3cqw] border-t border-gold pt-[1.2cqw]">L&apos;interview exclusive</li>
      </ul>

      {/* le nom, qui chevauche la photo */}
      <p
        className="absolute inset-x-0 bottom-[17cqw] z-[5] text-center font-display font-bold leading-[0.95] text-ink"
        style={{ fontSize: "10.5cqw", letterSpacing: "-0.01em", WebkitTextStroke: "0.7cqw var(--paper)", paintOrder: "stroke fill" }}
      >
        GRAOUROU
        <span className="block font-display font-normal italic" style={{ fontSize: "6.6cqw", WebkitTextStroke: "0.5cqw var(--paper)", paintOrder: "stroke fill" }}>
          Olivier Grace Divine
        </span>
      </p>

      {/* code-barres cliquable : télécharge le CV */}
      <a
        href={identite.cv}
        download
        aria-label="Télécharger le CV (PDF)"
        className="absolute bottom-[6.4cqw] right-[6cqw] z-[7] block w-[19cqw] border border-ink/40 transition-transform hover:scale-105"
      >
        <CodeBarres />
      </a>

      <p className="absolute bottom-[7cqw] left-[6cqw] z-[5] font-sans uppercase tracking-[0.2em] text-ink/70" style={{ fontSize: "2cqw" }}>
        {identite.ville}
      </p>
    </div>
  );
}
