"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePrefs } from "../PrefsProvider";
import { cloche, isEnabled } from "@/lib/sound";
import { CLAIR_DE_LUNE, HAUTEURS, TEMPO } from "./ChantTournesols";

/**
 * Un champ de tournesols pour le pied de page (dessiné ici en SVG, sans image) : trois rangées qui se chevauchent.
 * Chaque fleur est son propre petit SVG dans une couche à part : elle se balance sur le processeur graphique, sans repeindre
 * la page (50 tiges qui bougent dans un seul grand SVG faisaient ramer le défilement). Les positions sont calculées de façon déterministe
 * (aucun hasard : le rendu est identique côté serveur et côté navigateur).
 */

/** arrondi à 2 décimales : le serveur et le navigateur ne calculent pas les sinus à la même précision */
const n2 = (v: number) => Math.round(v * 100) / 100;

const alea = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return n2(x - Math.floor(x));
};

type Fleur = { x: number; hauteur: number; taille: number; inclinaison: number; delai: number; rangee: number };

function genere(): Fleur[] {
  const fleurs: Fleur[] = [];
  const rangees = [
    { n: 15, h: [96, 150], t: [20, 27], y: 0 },
    { n: 17, h: [78, 128], t: [24, 32], y: 1 },
    { n: 19, h: [52, 104], t: [27, 38], y: 2 },
  ];
  let k = 0;
  rangees.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      k++;
      fleurs.push({
        x: n2(((i + 0.5 + (alea(k) - 0.5) * 0.85) / r.n) * 1200),
        hauteur: n2(r.h[0] + alea(k + 40) * (r.h[1] - r.h[0])),
        taille: n2(r.t[0] + alea(k + 80) * (r.t[1] - r.t[0])),
        inclinaison: n2((alea(k + 120) - 0.5) * 16),
        delai: n2(alea(k + 160) * -5),
        rangee: ri,
      });
    }
  });
  return fleurs;
}

const FLEURS = genere();

/** Les tournesols qui chantent : sept fleurs de la rangée de devant, de gauche à droite, une par hauteur de note. */
const CHANTEURS: number[] = (() => {
  const devant = FLEURS.map((f, i) => ({ f, i })).filter((o) => o.f.rangee === 2).sort((a, b) => a.f.x - b.f.x);
  return HAUTEURS.map((_, k) => devant[Math.floor(((k + 0.5) / HAUTEURS.length) * devant.length)].i);
})();

const BASE = 250;

function Tournesol({ f, voix }: { f: Fleur; voix?: number }) {
  const teteY = BASE - f.hauteur;
  const r = f.taille;
  const petales = 16;
  const teinte = f.rangee === 0 ? ["#e8a900", "#c98f00"] : f.rangee === 1 ? ["#f2b400", "#dca100"] : ["#ffc61a", "#f0b000"];
  const feuille = f.rangee === 0 ? "#6b8a3a" : f.rangee === 1 ? "#7a9a41" : "#86a64a";
  // cadre de cette fleur dans le repère 1200 × 260 du champ
  const demi = n2(r * 2.4 + 8);
  const haut = n2(teteY - r * 1.7);
  const bas = 252;
  const largeur = demi * 2;
  const hauteurCadre = bas - haut;
  return (
    <div
      className="balance absolute"
      style={{
        left: `${n2(((f.x - demi) / 1200) * 100)}%`,
        top: `${n2((haut / 260) * 100)}%`,
        width: `${n2((largeur / 1200) * 100)}%`,
        height: `${n2((hauteurCadre / 260) * 100)}%`,
        ["--r" as string]: `${f.inclinaison}deg`,
        animationDelay: `${f.delai}s`,
        transformOrigin: `50% ${n2(((BASE - haut) / hauteurCadre) * 100)}%`,
      }}
    >
      <svg viewBox={`${-demi} ${haut} ${largeur} ${hauteurCadre}`} className="block h-full w-full overflow-visible">
        {/* tige et feuilles */}
        <path d={`M0 ${BASE} C ${n2(-4)} ${n2(BASE - f.hauteur * 0.4)}, ${3} ${n2(BASE - f.hauteur * 0.75)}, 0 ${teteY}`} fill="none" stroke="#5a7a2c" strokeWidth={n2(Math.max(2.4, r * 0.13))} strokeLinecap="round" />
        <path d={`M0 ${n2(BASE - f.hauteur * 0.38)} q ${n2(-r * 1.25)} ${n2(-r * 0.2)} ${n2(-r * 1.5)} ${n2(-r * 0.95)} q ${n2(r * 1.1)} ${n2(r * 0.05)} ${n2(r * 1.5)} ${n2(r * 0.95)}Z`} fill={feuille} />
        <path d={`M0 ${n2(BASE - f.hauteur * 0.2)} q ${n2(r * 1.25)} ${n2(-r * 0.2)} ${n2(r * 1.45)} ${n2(-r * 0.95)} q ${n2(-r * 1.1)} ${n2(r * 0.05)} ${n2(-r * 1.45)} ${n2(r * 0.95)}Z`} fill={feuille} opacity=".95" />
        {/* tête : pétales puis cœur */}
        <g transform={`translate(0 ${teteY})`}>
          <g data-voix={voix} style={voix !== undefined ? { cursor: "pointer" } : undefined}>
            {Array.from({ length: petales }, (_, i) => (
              <ellipse key={i} cx="0" cy={n2(-r * 0.98)} rx={n2(r * 0.24)} ry={n2(r * 0.5)} fill={teinte[i % 2]} transform={`rotate(${n2((360 / petales) * i)})`} />
            ))}
            <circle r={n2(r * 0.62)} fill="#4e3418" />
            <circle r={n2(r * 0.46)} fill="#6a4a22" />
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={n2(Math.cos((i / 9) * 6.283) * r * 0.3)} cy={n2(Math.sin((i / 9) * 6.283) * r * 0.3)} r={n2(r * 0.045)} fill="#3b2710" />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

export function Tournesols({ className = "" }: { className?: string }) {
  const champ = useRef<HTMLDivElement>(null);
  const { reducedMotion } = usePrefs();
  const [indice, setIndice] = useState(false);
  const chant = useRef<{ minuteurs: ReturnType<typeof setTimeout>[]; en_cours: boolean }>({ minuteurs: [], en_cours: false });

  /** Un tournesol « chante » : sa tête fait un petit bond et une note monte au-dessus de lui. */
  const faireChanter = (k: number) => {
    const el = champ.current;
    if (!el || reducedMotion) return;
    const tete = el.querySelector(`[data-voix="${k}"]`) as SVGGElement | null;
    if (!tete) return;
    const f = FLEURS[CHANTEURS[k]];
    gsap.fromTo(tete, { scale: 1, transformOrigin: "0px 0px" }, { scale: 1.32, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", overwrite: "auto" });
    const couche = el.querySelector("[data-notes]") as SVGGElement;
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.textContent = Math.random() > 0.5 ? "♪" : "♫";
    t.setAttribute("x", String(f.x));
    t.setAttribute("y", String(BASE - f.hauteur - f.taille * 1.3));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("font-size", "46");
    t.setAttribute("font-family", "serif");
    t.setAttribute("font-weight", "700");
    t.setAttribute("fill", k % 2 ? "#121212" : "#b87f00");
    couche.appendChild(t);
    gsap.to(t, { y: -70, x: (Math.random() - 0.5) * 30, opacity: 0, duration: 1.6, ease: "power1.out", onComplete: () => t.remove() });
  };

  const arreter = () => {
    chant.current.minuteurs.forEach(clearTimeout);
    chant.current.minuteurs = [];
    chant.current.en_cours = false;
    setIndice(false);
  };

  const commencer = () => {
    if (chant.current.en_cours) return;
    chant.current.en_cours = true;
    setIndice(!isEnabled());
    let t = 600;
    CLAIR_DE_LUNE.forEach((n) => {
      const k = HAUTEURS.indexOf(n.f);
      chant.current.minuteurs.push(
        setTimeout(() => {
          cloche(n.f);
          faireChanter(k);
        }, t),
      );
      t += (n.temps * 60000) / TEMPO;
    });
    chant.current.minuteurs.push(setTimeout(() => setIndice(false), t + 800));
  };

  useEffect(() => {
    const el = champ.current;
    if (!el) return;
    // le champ ne bouge que lorsqu'il est à l'écran, et il chante quand on arrive en bas de la page
    const voir = new IntersectionObserver(([e]) => (e.isIntersecting ? el.setAttribute("data-actif", "") : el.removeAttribute("data-actif")), { rootMargin: "80px" });
    const arrive = new IntersectionObserver(([e]) => (e.isIntersecting ? commencer() : arreter()), { threshold: 0.7 });
    voir.observe(el);
    arrive.observe(el);
    const ts = chant.current;
    return () => {
      voir.disconnect();
      arrive.disconnect();
      ts.minuteurs.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={champ}
      aria-hidden="true"
      className={`champ relative w-full ${className}`}
      style={{ aspectRatio: "1200 / 260" }}
      onPointerDown={(e) => {
        const g = (e.target as Element).closest("[data-voix]");
        if (!g) return;
        const k = Number(g.getAttribute("data-voix"));
        cloche(HAUTEURS[k]);
        faireChanter(k);
      }}
    >
      {FLEURS.map((f, i) => (
        <Tournesol key={i} f={f} voix={CHANTEURS.indexOf(i) >= 0 ? CHANTEURS.indexOf(i) : undefined} />
      ))}
      {/* l'herbe */}
      <div className="absolute inset-x-0 bottom-0 bg-[#5a7a2c]" style={{ height: `${n2((12 / 260) * 100)}%` }} />
      {/* les notes de musique qui montent au-dessus des fleurs */}
      <svg viewBox="0 0 1200 260" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <g data-notes />
      </svg>
      {indice && (
        <p role="status" className="label pointer-events-none absolute inset-x-0 top-2 text-center !text-ink/70">
          ♪ Les tournesols chantent : active le son (bouton en bas à gauche) pour les entendre
        </p>
      )}
    </div>
  );
}
