"use client";

import { useRef } from "react";
import { projets } from "@/content/projets";
import { identite } from "@/content/identite";
import { pad } from "@/content/sections";
import { OuvertureVisuel, construireOuverture } from "../reportages/ouvertures";
import { ReportageContenu } from "../reportages/ReportageContenu";
import { usePrefs } from "../PrefsProvider";
import { gsap, PRIO, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/** Numéro de page de chaque reportage dans la plage p. 08-15. */
const pageDe = (i: number) => pad(8 + Math.floor((i * 8) / projets.length));

/**
 * p. 08-15 — Reportages
 * Effet : des pages empilées qui se décollent une à une au scroll, comme on feuillette.
 * Chaque reportage s'ouvre sur son propre effet (rendez-vous, badge tamponné, livres, stock, ticket + canopée, ligne de métro).
 * Son : une page qu'on tourne à chaque reportage.
 */
export function Reportages() {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion } = usePrefs();

  useScene(ref, (root) => {
    const pages = gsap.utils.toArray<HTMLElement>("[data-rp]", root);
    const SEG = 3.4;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root.querySelector("[data-pin]"),
        start: "top top",
        end: `+=${pages.length * 190}%`,
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        refreshPriority: PRIO.reportages,
      },
    });

    pages.forEach((pg, i) => {
      const t0 = i * SEG;
      const ouv = pg.querySelector("[data-ouv]") as HTMLElement;
      const fin = construireOuverture(projets[i].ouverture, ouv, tl, t0 + 0.1);
      if (i === 0) tl.call(() => play("page"), [], 0.05);
      if (i < pages.length - 1) {
        const pel = t0 + SEG - 0.7;
        tl.call(() => play("page"), [], pel)
          .to(pg, { rotationY: -112, xPercent: -6, opacity: 0.0, transformOrigin: "0% 50%", transformPerspective: 1700, duration: 0.7, ease: "power2.in" }, pel);
      }
      void fin;
    });
  });

  if (reducedMotion) {
    return (
      <section id="reportages" aria-labelledby="reportages-titre" className="relative pb-6 pl-4 pr-10 pt-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="label flex justify-between">
            <span>{identite.magazine} · Reportages</span>
            <span className="tabular-nums">p. 08-15</span>
          </p>
          <h2 id="reportages-titre" className="mt-3 font-display text-5xl italic leading-none sm:text-7xl">
            Reportages
          </h2>
          <hr className="filet mt-5" />
          <div className="mt-10 space-y-20">
            {projets.map((p, i) => (
              <ReportageContenu key={p.slug} projet={p} page={pageDe(i)} lien />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reportages" ref={ref} aria-labelledby="reportages-titre">
      <div data-pin className="relative h-svh overflow-hidden" style={{ perspective: "1700px" }}>
        <h2 id="reportages-titre" className="sr-only">
          Reportages
        </h2>
        {projets.map((p, i) => (
          <div
            key={p.slug}
            data-rp
            className="absolute inset-0 overflow-hidden bg-bg pb-14 pl-4 pr-10 pt-20 shadow-[0_0_40px_rgba(0,0,0,.18)] sm:px-8"
            style={{ zIndex: projets.length - i, backfaceVisibility: "hidden" }}
          >
            <div data-contenu className="flex h-full flex-col justify-start">
              <ReportageContenu projet={p} compact niveau={3} page={pageDe(i)} lien />
            </div>
            <OuvertureVisuel type={p.ouverture} />
            <p className="label absolute inset-x-0 bottom-4 z-30 flex justify-between pl-4 pr-10 sm:px-8">
              <span>{identite.magazine}</span>
              <span className="tabular-nums">p. {pageDe(i)}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
