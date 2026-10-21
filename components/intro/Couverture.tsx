"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { identite } from "@/content/identite";
import { projets } from "@/content/projets";
import { usePortraitDisponible } from "../PortraitContext";

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
      <path d="M0 520c8-110 60-150 130-168l50-14h40l50 14c70 18 122 58 130 168Z" fill="#121212" />
      <rect x="168" y="262" width="64" height="80" rx="28" fill="#121212" />
      <ellipse cx="200" cy="190" rx="78" ry="96" fill="#121212" />
    </svg>
  );
}

function CodeBarres() {
  const barres = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 3];
  let x = 0;
  return (
    <svg viewBox="0 0 70 34" aria-hidden="true" className="block w-full">
      <rect width="70" height="34" fill="#ffffff" />
      {barres.map((w, i) => {
        const bx = 3 + x;
        x += w + 1.2;
        return i % 2 === 0 ? <rect key={i} x={bx} y="3" width={w} height="24" fill="#121212" /> : null;
      })}
      <text x="35" y="32" textAnchor="middle" fontSize="3.6" fontFamily="monospace" fill="#121212">
        0 01 2026 CV
      </text>
    </svg>
  );
}

function Etoile({ className, couleur = "#f2b400" }: { className: string; couleur?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={`absolute ${className}`}>
      <path d="M20 0c1.5 11 8.5 18.5 20 20-11.5 1.5-18.5 9-20 20-1.5-11-8.5-18.5-20-20C11.5 18.5 18.5 11 20 0Z" fill={couleur} />
    </svg>
  );
}

/** Pastille collée sur la couverture, comme un autocollant. */
function Sticker({ children, className, fond, texte, rot }: { children: React.ReactNode; className: string; fond: string; texte: string; rot: number }) {
  return (
    <li
      className={`absolute font-sans font-extrabold uppercase leading-tight ${className}`}
      style={{ background: fond, color: texte, transform: `rotate(${rot}deg)`, fontSize: "2.2cqw", letterSpacing: "0.08em", padding: "1.2cqw 2cqw", maxWidth: "27cqw", borderRadius: "1.2cqw", border: "0.25cqw solid #121212", boxShadow: "none" }}
    >
      {children}
    </li>
  );
}

/**
 * Une de magazine, bien colorée. Toutes les dimensions sont en cqw : la couverture garde ses proportions à toute taille.
 * Le titre est DERRIÈRE le portrait, le nom le chevauche.
 */
export function Couverture({ titre: Titre = "p" }: { titre?: "h1" | "p" }) {
  const dispo = usePortraitDisponible();
  const [portraitOk, setPortraitOk] = useState(true);

  return (
    <div className="relative h-full w-full overflow-hidden text-[#121212]" style={{ containerType: "inline-size", background: "#ffffff", fontFamily: "var(--font-serif)" }}>
      {/* le soleil derrière la tête */}
      <div className="absolute left-1/2 top-[34cqw] z-[1] aspect-square w-[78cqw] -translate-x-1/2 rounded-full" style={{ background: "#f2b400" }} />
      <div className="absolute left-1/2 top-[34cqw] z-[1] aspect-square w-[78cqw] -translate-x-1/2 rounded-full opacity-60" style={{ background: "repeating-conic-gradient(from 0deg, #f7c93a 0 6deg, transparent 6deg 15deg)" }} />

      {/* cadre intérieur */}
      <div className="pointer-events-none absolute inset-[2.6cqw] z-[8] border-2" style={{ borderColor: "#121212" }} />

      {/* en-tête */}
      <div className="absolute inset-x-[6cqw] top-[5.2cqw] z-[6] flex justify-between font-sans font-bold uppercase tracking-[0.2em]" style={{ fontSize: "2cqw" }}>
        <Edition />
        <span>Le magazine de Divine</span>
      </div>

      {/* le titre, DERRIÈRE le portrait */}
      <Titre
        className="absolute inset-x-0 top-[12cqw] z-[2] text-center font-display font-black italic leading-none"
        style={{ fontSize: "12.2cqw", letterSpacing: "-0.04em", color: "#121212" }}
      >
        {identite.magazine}
      </Titre>

      {/* le portrait */}
      <div className="absolute bottom-0 left-1/2 z-[3] h-[116cqw] w-[58cqw] -translate-x-1/2">
        {portraitOk && dispo ? (
          <Image
            src={identite.portrait}
            alt="Portrait de Divine Graourou"
            fill
            sizes="(max-width: 768px) 70vw, 420px"
            className="object-contain object-bottom"
            priority
            onError={() => setPortraitOk(false)}
          />
        ) : (
          <PortraitDeSecours />
        )}
      </div>

      {/* étoiles */}
      <Etoile className="left-[9cqw] top-[34cqw] z-[4] w-[7cqw]" />
      <Etoile className="right-[9cqw] top-[52cqw] z-[4] w-[6cqw]" couleur="#121212" />
      <Etoile className="left-[14cqw] top-[96cqw] z-[4] w-[5cqw]" couleur="#121212" />

      {/* accroches, collées comme des autocollants */}
      <ul className="m-0 list-none p-0">
        <Sticker className="left-[5cqw] top-[46cqw] z-[5]" fond="#121212" texte="#ffffff" rot={-6}>
          {identite.accroches[0]}
        </Sticker>
        <Sticker className="left-[7cqw] top-[62cqw] z-[5]" fond="#ffffff" texte="#121212" rot={4}>
          {identite.accroches[1]}
        </Sticker>
        <Sticker className="left-[5cqw] top-[76cqw] z-[5]" fond="#121212" texte="#ffffff" rot={-3}>
          {identite.accroches[2]}
        </Sticker>
        <Sticker className="right-[5cqw] top-[54cqw] z-[5] text-right" fond="#f2b400" texte="#121212" rot={5}>
          {projets.length} projets à la une
        </Sticker>
        <Sticker className="right-[6cqw] top-[72cqw] z-[5] text-right" fond="#ffffff" texte="#121212" rot={-4}>
          L&apos;interview exclusive
        </Sticker>
      </ul>

      {/* le nom, qui chevauche la photo */}
      <p className="absolute inset-x-0 bottom-[16cqw] z-[6] text-center font-display font-black leading-[0.92]" style={{ fontSize: "12.5cqw", letterSpacing: "-0.02em", color: "#121212", WebkitTextStroke: "0.9cqw #ffffff", paintOrder: "stroke fill" }}>
        GRAOUROU
        <span className="block font-display font-bold italic" style={{ fontSize: "6.8cqw", color: "#b87f00", WebkitTextStroke: "0.7cqw #ffffff", paintOrder: "stroke fill" }}>
          Olivier Grace Divine
        </span>
      </p>

      {/* code-barres cliquable : télécharge le CV */}
      <a
        href={identite.cv}
        download
        aria-label="Télécharger le CV (PDF)"
        className="absolute bottom-[5.5cqw] right-[5.5cqw] z-[9] block w-[19cqw] border-2 border-[#121212] transition-transform hover:scale-105"
      >
        <CodeBarres />
      </a>

      <p className="absolute bottom-[6.2cqw] left-[6cqw] z-[6] font-sans font-bold uppercase tracking-[0.2em]" style={{ fontSize: "2cqw" }}>
        {identite.ville}
      </p>
    </div>
  );
}
