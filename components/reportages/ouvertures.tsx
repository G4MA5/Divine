"use client";

import gsap from "gsap";
import type { Projet } from "@/content/projets";
import { play } from "@/lib/sound";

/**
 * Les 6 effets d'ouverture des reportages. Chacun a son visuel (OuvertureVisuel) et sa chorégraphie
 * (construireOuverture), qui ajoute ses tweens à une timeline donnée : la pile de reportages la pilote au scroll,
 * la page d'un reportage la joue d'un trait.
 */

type Type = Projet["ouverture"];

const LIVRES = ["#6b4a3a", "#2f4a43", "#8a6d2f", "#3a3d5c", "#7a2f3a", "#4d5b3a", "#5a4a6b", "#8a5a3c", "#2f3d4a"];
const FEUILLES = ["#3f6a4a", "#5a8a5f", "#2f5238"];

function Carte({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div data-carte className={`border border-gold bg-paper p-5 text-ink shadow-[0_24px_50px_-24px_rgba(0,0,0,.5)] ${className}`}>
      {children}
    </div>
  );
}

export function OuvertureVisuel({ type }: { type: Type }) {
  return (
    <div data-ouv aria-hidden="true" className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-bg">
      {type === "rendez-vous" && (
        <Carte className="w-[min(78vw,300px)]">
          <p className="label !text-ink/60">Prendre rendez-vous</p>
          {["Nom", "Date", "Heure"].map((l) => (
            <div key={l} className="mt-4">
              <span className="label !text-ink/50">{l}</span>
              <div className="mt-1 h-7 border-b border-ink/30">
                <span data-champ className="block h-full origin-left bg-gold/35" />
              </div>
            </div>
          ))}
          <div className="mt-5 flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="var(--gold)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path data-coche d="M4 12.5l5 5L20 6.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
            </svg>
            <p data-ok className="font-display italic">
              Rendez-vous confirmé
            </p>
          </div>
        </Carte>
      )}

      {type === "badge" && (
        <Carte className="relative w-56 text-center">
          <div className="mx-auto h-3 w-14 rounded-full border border-ink/40" />
          <p className="label mt-3 !text-ink/60">Génie UPB</p>
          <div className="mx-auto mt-4 h-20 w-20 rounded-full bg-ink/10" />
          <div className="mx-auto mt-4 h-3 w-32 bg-ink/20" />
          <div className="mx-auto mt-2 h-3 w-20 bg-ink/15" />
          <p className="label mt-5 !text-ink/60">Participant</p>
          <span
            data-tampon
            className="absolute bottom-8 right-2 -rotate-12 border-2 border-gold px-3 py-1 font-sans text-sm font-bold tracking-[0.3em] text-gold"
          >
            VALIDÉ
          </span>
        </Carte>
      )}

      {type === "livres" && (
        <div className="relative w-[min(84vw,420px)]">
          <div className="flex items-end gap-1">
            {LIVRES.map((c, i) => (
              <span
                key={c}
                data-livre
                className="block flex-1 rounded-t-sm"
                style={{ background: c, height: `${92 + ((i * 37) % 60)}px`, borderTop: "3px solid rgba(255,255,255,.18)" }}
              />
            ))}
          </div>
          <div className="h-2 bg-accent" />
        </div>
      )}

      {type === "stock" && (
        <div className="w-[min(84vw,420px)]">
          <p className="label mb-3 flex justify-between">
            <span>En stock</span>
            <span data-compteur className="tabular-nums text-accent">
              0 produit
            </span>
          </p>
          <div className="flex items-end justify-between gap-2">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} data-produit className="block">
                {i % 3 === 0 && (
                  <svg viewBox="0 0 20 56" className="h-12 w-4">
                    <rect x="6" y="0" width="8" height="9" rx="2" fill="var(--accent)" />
                    <rect x="2" y="8" width="16" height="46" rx="5" fill="var(--fg)" opacity=".8" />
                  </svg>
                )}
                {i % 3 === 1 && (
                  <svg viewBox="0 0 44 14" className="h-3 w-9">
                    <rect width="44" height="7" rx="2" fill="var(--accent)" />
                    {Array.from({ length: 10 }, (_, k) => (
                      <rect key={k} x={2 + k * 4.2} y="7" width="1.8" height="7" fill="var(--fg)" opacity=".8" />
                    ))}
                  </svg>
                )}
                {i % 3 === 2 && (
                  <svg viewBox="0 0 30 30" className="h-7 w-7">
                    <rect x="2" y="9" width="26" height="19" rx="4" fill="var(--fg)" opacity=".8" />
                    <rect x="4" y="2" width="22" height="8" rx="3" fill="var(--accent)" />
                  </svg>
                )}
              </span>
            ))}
          </div>
          <div className="mt-1 h-2 bg-accent" />
        </div>
      )}

      {type === "ticket" && (
        <>
          <Carte data-ticket className="relative w-[min(78vw,300px)]">
            <p className="label !text-ink/60">Ticket SAV</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-xl italic">N° 0001</span>
              <span className="relative inline-block h-7 w-24">
                <span data-ouvert className="absolute inset-0 flex items-center justify-center border border-ink/50 label !text-ink">
                  Ouvert
                </span>
                <span data-resolu className="absolute inset-0 flex items-center justify-center bg-gold label !text-paper">
                  Résolu
                </span>
              </span>
            </div>
            <div className="mt-4 h-2.5 w-full bg-ink/15" />
            <div className="mt-2 h-2.5 w-4/5 bg-ink/15" />
            <div className="mt-2 h-2.5 w-3/5 bg-ink/15" />
          </Carte>
          <svg data-canopee viewBox="-100 -100 200 200" className="pointer-events-none absolute left-1/2 top-1/2 h-[170vmax] w-[170vmax] -translate-x-1/2 -translate-y-1/2">
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i} data-feuille transform={`rotate(${i * 40})`}>
                <path d="M0 0C14 -22 14 -56 0 -92C-14 -56 -14 -22 0 0Z" fill={FEUILLES[i % 3]} />
                <path d="M0 -4V-84" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
              </g>
            ))}
          </svg>
        </>
      )}

      {type === "metro" && (
        <svg viewBox="0 0 300 150" className="w-[min(86vw,440px)]" fill="none">
          <path data-ligne d="M20 100H70L110 60H170L200 90H230L280 40" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
          {[
            [20, 100],
            [70, 100],
            [110, 60],
            [170, 60],
            [230, 90],
            [280, 40],
          ].map(([x, y], i) => (
            <circle key={i} data-station cx={x} cy={y} r="7" fill="var(--bg)" stroke="var(--fg)" strokeWidth="3" />
          ))}
          <g data-rame>
            <rect x="-9" y="-6" width="18" height="12" rx="4" fill="var(--fg)" />
            <rect x="-5" y="-3" width="10" height="4" rx="1" fill="var(--accent)" />
          </g>
          <circle cx="20" cy="30" r="13" fill="var(--accent)" />
          <text x="20" y="35" textAnchor="middle" fontSize="14" fontFamily="var(--font-inter)" fontWeight="700" fill="var(--bg)">
            M
          </text>
        </svg>
      )}
    </div>
  );
}

/**
 * Ajoute à `tl` la chorégraphie d'ouverture, à partir de t0. Renvoie l'instant où le contenu est entièrement dégagé.
 */
export function construireOuverture(type: Type, ouv: HTMLElement, tl: gsap.core.Timeline, t0: number): number {
  const $ = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s, ouv);
  let fin = t0 + 1;

  if (type === "rendez-vous") {
    const [carte] = $("[data-carte]");
    gsap.set($("[data-champ]"), { scaleX: 0 });
    gsap.set($("[data-ok]"), { opacity: 0 });
    gsap.set(carte, { y: 30, opacity: 0 });
    tl.to(carte, { y: 0, opacity: 1, duration: 0.3 }, t0)
      .to($("[data-champ]"), { scaleX: 1, duration: 0.3, stagger: 0.28 }, t0 + 0.3)
      .to($("[data-coche]"), { strokeDashoffset: 0, duration: 0.3 }, t0 + 1.2)
      .to($("[data-ok]"), { opacity: 1, duration: 0.2 }, t0 + 1.4)
      .to(carte, { scale: 1.12, opacity: 0, duration: 0.4 }, t0 + 1.8);
    fin = t0 + 2.2;
  }

  if (type === "badge") {
    const [carte] = $("[data-carte]");
    const [tampon] = $("[data-tampon]");
    gsap.set(tampon, { scale: 3, opacity: 0 });
    gsap.set(carte, { y: -50, opacity: 0 });
    tl.to(carte, { y: 0, opacity: 1, duration: 0.5 }, t0)
      .call(() => play("tampon"), [], t0 + 0.9)
      .to(tampon, { scale: 1, opacity: 1, duration: 0.25, ease: "power4.in" }, t0 + 0.9)
      .to(carte, { y: -30, opacity: 0, duration: 0.45 }, t0 + 1.8);
    fin = t0 + 2.2;
  }

  if (type === "livres") {
    const livres = $("[data-livre]");
    gsap.set(livres, { x: -140, opacity: 0, rotation: -18, transformOrigin: "bottom left" });
    tl.to(livres, { x: 0, opacity: 1, rotation: 0, stagger: 0.09, duration: 0.45 }, t0)
      .to(livres[4], { y: -16, scale: 1.12, duration: 0.3, transformOrigin: "center bottom" }, t0 + 1.2)
      .to(livres[4], { scale: 9, duration: 0.7, ease: "power3.in" }, t0 + 1.55)
      .to(livres.filter((_, i) => i !== 4), { opacity: 0, y: 30, duration: 0.4 }, t0 + 1.55);
    fin = t0 + 2.3;
  }

  if (type === "stock") {
    const produits = $("[data-produit]");
    const compteur = $("[data-compteur]")[0];
    const c = { n: 0 };
    gsap.set(produits, { y: -280, opacity: 0 });
    tl.to(produits, { y: 0, opacity: 1, duration: 0.55, ease: "bounce.out", stagger: 0.1 }, t0)
      .to(
        c,
        {
          n: produits.length,
          duration: 1.2,
          ease: "none",
          snap: { n: 1 },
          onUpdate: () => {
            compteur.textContent = `${Math.round(c.n)} produit${Math.round(c.n) > 1 ? "s" : ""}`;
          },
        },
        t0,
      )
      .to(ouv.firstElementChild, { y: 30, opacity: 0, duration: 0.45 }, t0 + 1.9);
    fin = t0 + 2.3;
  }

  if (type === "ticket") {
    const [carte] = $("[data-carte]");
    const feuilles = $("[data-feuille]");
    gsap.set($("[data-resolu]"), { opacity: 0 });
    gsap.set(carte, { y: 30, opacity: 0 });
    gsap.set(feuilles, { scale: 0, rotation: "+=0", transformOrigin: "0 0" });
    tl.to(carte, { y: 0, opacity: 1, duration: 0.3 }, t0)
      .to($("[data-resolu]"), { opacity: 1, duration: 0.3 }, t0 + 0.9)
      .to($("[data-ouvert]"), { opacity: 0, duration: 0.3 }, t0 + 0.9)
      .to(carte, { opacity: 0, scale: 0.9, duration: 0.3 }, t0 + 1.6)
      .to(feuilles, { scale: 1.2, duration: 0.7, stagger: 0.04, ease: "power2.out" }, t0 + 1.7)
      .to(feuilles, { scale: 3.4, opacity: 0, duration: 0.7, stagger: 0.03, ease: "power2.in" }, t0 + 2.45);
    fin = t0 + 3.2;
  }

  if (type === "metro") {
    const stations = $<SVGCircleElement>("[data-station]");
    const [rame] = $("[data-rame]");
    const pts = [
      [20, 100],
      [70, 100],
      [110, 60],
      [170, 60],
      [230, 90],
      [280, 40],
    ];
    gsap.set(stations, { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
    gsap.set(rame, { x: pts[0][0], y: pts[0][1] - 14 });
    tl.to($("[data-ligne]"), { strokeDashoffset: 0, duration: 1.4, ease: "none" }, t0);
    stations.forEach((s, i) => tl.to(s, { scale: 1, duration: 0.2, ease: "back.out(3)" }, t0 + (i / (stations.length - 1)) * 1.3));
    pts.forEach(([x, y], i) => i > 0 && tl.to(rame, { x, y: y - 14, duration: 1.4 / (pts.length - 1), ease: "none" }, t0 + ((i - 1) / (pts.length - 1)) * 1.4));
    fin = t0 + 1.9;
  }

  tl.to(ouv, { opacity: 0, duration: 0.4 }, fin - 0.1).set(ouv, { pointerEvents: "none" }, fin + 0.3);
  return fin + 0.3;
}
