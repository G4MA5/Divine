"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { identite } from "@/content/identite";

const SYMBOLES = ["<", "/", ">", "{", "}", ";", "(", ")", "=", "#", "*", "+", "@", "&", "%"];

/** Le petit personnage doré, bouche qui mâche (deux demi-disques qui s'ouvrent et se ferment). */
export function Pac({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g className="pac-haut">
        <path d="M0 50a50 50 0 0 1 100 0Z" fill="#f2b400" />
        <circle cx="62" cy="28" r="6" fill="#121212" />
      </g>
      <g className="pac-bas">
        <path d="M0 50a50 50 0 0 0 100 0Z" fill="#f2b400" />
      </g>
    </svg>
  );
}

/**
 * Écran de chargement : un petit personnage traverse une ligne de symboles de code et les mange ;
 * derrière lui, chaque symbole devient une lettre du titre [div_dev_Now], qui monte depuis la ligne de base.
 * Puis le rideau se lève sur l'écran d'accueil.
 */
export function Chargement({ onFin }: { onFin: () => void }) {
  const racine = useRef<HTMLDivElement>(null);
  const titre = identite.magazine;
  const lettres = [...titre];

  useEffect(() => {
    const root = racine.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const pac = root.querySelector("[data-pac]") as HTMLElement;
      const rangee = root.querySelector("[data-rangee]") as HTMLElement;
      const slots = gsap.utils.toArray<HTMLElement>("[data-slot]", root);
      const N = slots.length;
      const W = rangee.clientWidth;
      const duree = 2.4;
      gsap.set(pac, { x: -pac.clientWidth * 1.4 });
      gsap.set(root.querySelectorAll("[data-lettre]"), { scaleY: 0, transformOrigin: "50% 100%" });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(root, { yPercent: -100, duration: 0.85, ease: "power3.inOut", onComplete: onFin });
        },
      });
      tl.to(pac, { x: W + pac.clientWidth * 0.6, duration: duree, ease: "none" }, 0.3);
      slots.forEach((slot, i) => {
        const t = 0.3 + ((i + 0.5) / N) * duree * (W / (W + pac.clientWidth * 2)) + 0.1;
        tl.to(slot.querySelector("[data-glyphe]"), { opacity: 0, scale: 0.4, duration: 0.12 }, t)
          .to(slot.querySelector("[data-lettre]"), { scaleY: 1, duration: 0.45, ease: "back.out(2.2)" }, t + 0.05);
      });
      tl.to(root.querySelector("[data-legende]"), { opacity: 1, duration: 0.4 }, 0.3);
      tl.to({}, { duration: 0.7 }); // on laisse le titre respirer
    }, root);
    return () => ctx.revert();
  }, [onFin]);

  return (
    <div ref={racine} role="status" aria-label="Chargement du magazine" className="fixed inset-0 z-[65] flex flex-col items-center justify-center bg-[#0b0b0b] text-[#f4f1ea]">
      <div data-rangee className="relative flex font-mono font-bold" style={{ fontSize: "clamp(1.5rem, 5.2vw, 3.4rem)", lineHeight: 1.2 }}>
        {lettres.map((l, i) => (
          <span key={i} data-slot className="relative inline-block text-center" style={{ width: "1ch" }}>
            <span data-glyphe aria-hidden="true" className="absolute inset-0 text-[#6d6a63]">
              {SYMBOLES[i % SYMBOLES.length]}
            </span>
            <span data-lettre aria-hidden="true" className="inline-block">
              {l}
            </span>
          </span>
        ))}
        <span data-pac className="absolute left-0 top-1/2 -translate-y-1/2" style={{ width: "1.9ch", height: "1.9ch" }}>
          <Pac className="h-full w-full" />
        </span>
      </div>
      <p data-legende className="label mt-10 !text-[#a8a59c] opacity-0">
        {identite.numero} · chargement du numéro
      </p>
      <style>{`
        .pac-haut { transform-origin: 50px 50px; animation: pacHaut 0.28s ease-in-out infinite alternate; }
        .pac-bas { transform-origin: 50px 50px; animation: pacBas 0.28s ease-in-out infinite alternate; }
        @keyframes pacHaut { from { transform: rotate(0deg); } to { transform: rotate(-26deg); } }
        @keyframes pacBas { from { transform: rotate(0deg); } to { transform: rotate(26deg); } }
      `}</style>
    </div>
  );
}
