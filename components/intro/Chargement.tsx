"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { identite } from "@/content/identite";

/**
 * Écran de chargement : un compteur de 0 à 100 en très grands chiffres, le titre dont les lettres montent depuis la ligne
 * de base, un filet qui se remplit. À 100, le rideau noir se lève en gardant un bord arrondi (il « s'envole »).
 */
export function Chargement({ onFin }: { onFin: () => void }) {
  const racine = useRef<HTMLDivElement>(null);
  const lettres = [...identite.magazine];

  useEffect(() => {
    const root = racine.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const compteur = root.querySelector("[data-compteur]") as HTMLElement;
      const filet = root.querySelector("[data-filet]") as HTMLElement;
      const c = { v: 0 };
      gsap.set(root.querySelectorAll("[data-l]"), { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(filet, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(root, { yPercent: -108, duration: 1, ease: "power4.inOut", onComplete: onFin });
        },
      });
      tl.to(root.querySelectorAll("[data-l]"), { scaleY: 1, duration: 0.7, ease: "power3.out", stagger: 0.045 }, 0.1)
        .to(
          c,
          {
            v: 100,
            duration: 2.4,
            ease: "power2.inOut",
            onUpdate: () => {
              compteur.textContent = String(Math.round(c.v)).padStart(3, "0");
            },
          },
          0.2,
        )
        .to(filet, { scaleX: 1, duration: 2.4, ease: "power2.inOut" }, 0.2)
        .to(compteur, { yPercent: -30, opacity: 0, duration: 0.5, ease: "power2.in" }, 2.7)
        .to(root.querySelector("[data-titre]"), { scale: 1.06, duration: 0.6, ease: "power2.inOut" }, 2.7)
        .to({}, { duration: 0.25 });
    }, root);
    return () => ctx.revert();
  }, [onFin]);

  return (
    <div
      ref={racine}
      role="status"
      aria-label="Chargement du magazine"
      className="fixed inset-0 z-[65] flex flex-col items-center justify-center bg-[#0b0b0b] text-[#f4f1ea]"
      style={{ borderBottomLeftRadius: "50% 7vh", borderBottomRightRadius: "50% 7vh" }}
    >
      <p data-compteur aria-hidden="true" className="font-display font-black leading-none tabular-nums" style={{ fontSize: "clamp(6rem, 26vw, 19rem)", letterSpacing: "-0.04em" }}>
        000
      </p>
      <p data-titre className="mt-6 flex font-display text-2xl font-bold italic sm:text-4xl" aria-hidden="true">
        {lettres.map((l, i) => (
          <span key={i} data-l className="inline-block" style={{ whiteSpace: "pre" }}>
            {l}
          </span>
        ))}
      </p>
      <p className="label mt-3 !text-[#a8a59c]">{identite.numero} · chargement</p>
      <span aria-hidden="true" className="absolute inset-x-6 bottom-8 h-px bg-white/15 sm:inset-x-10">
        <span data-filet className="block h-full w-full bg-gold" />
      </span>
    </div>
  );
}
