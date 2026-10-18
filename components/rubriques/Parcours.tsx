"use client";

import { useRef } from "react";
import { parcours } from "@/content/parcours";
import { identite } from "@/content/identite";
import { PiedDePage } from "../ui/PiedDePage";
import { gsap, ScrollTrigger, PRIO, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 04-05 — Parcours
 * Effet : défilement horizontal épinglé. Le scroll vertical fait glisser une frise panoramique façon double page.
 * Chaque étape est un « article » avec sa date en gros chiffres dorés. Son : un léger « tic » à chaque étape.
 */
export function Parcours() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (root) => {
    const track = root.querySelector("[data-track]") as HTMLElement;
    const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", root);

    const defile = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth + 24),
      ease: "none",
      scrollTrigger: {
        trigger: root,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        end: () => `+=${track.scrollWidth}`,
        invalidateOnRefresh: true,
        refreshPriority: PRIO.parcours,
      },
    });

    panels.forEach((p) => {
      gsap.fromTo(
        p.querySelectorAll("[data-an]"),
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, ease: "none", stagger: 0.08, scrollTrigger: { trigger: p, containerAnimation: defile, start: "left 92%", end: "left 55%", scrub: true } },
      );
      ScrollTrigger.create({
        trigger: p,
        containerAnimation: defile,
        start: "left 62%",
        onEnter: () => play("tic"),
        onEnterBack: () => play("tic"),
      });
    });

    // la ligne de la frise se trace au fil du défilement
    gsap.fromTo(
      root.querySelector("[data-fil]"),
      { scaleX: 0 },
      { scaleX: 1, ease: "none", transformOrigin: "left", scrollTrigger: { trigger: root, scrub: 0.6, end: () => `+=${track.scrollWidth}` } },
    );
  });

  return (
    <section id="parcours" ref={ref} aria-labelledby="parcours-titre" className="relative h-svh overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 pl-4 pr-10 pt-20 sm:px-8">
        <p className="label flex justify-between">
          <span>{identite.magazine} · Parcours</span>
          <span className="tabular-nums">p. 04-05</span>
        </p>
        <h2 id="parcours-titre" className="mt-3 font-display text-5xl italic leading-none sm:text-7xl">
          Parcours
        </h2>
        <hr className="filet mt-4" />
      </div>

      {/* la gouttière de la double page */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent sm:block" />

      <ol data-track className="absolute bottom-0 left-0 top-0 flex items-center gap-8 pl-6 pr-10 pt-24 will-change-transform sm:gap-16 sm:pl-12">
        {parcours.map((e, i) => (
          <li key={e.titre} data-panel className="relative w-[78vw] shrink-0 sm:w-[44vw] sm:max-w-xl">
            <p data-an className="font-display text-[clamp(3.2rem,13vw,7.5rem)] italic leading-none text-accent tabular-nums">
              {e.periode}
            </p>
            <p data-an className="label mt-2">
              Étape {i + 1} / {parcours.length}
            </p>
            <h3 data-an className="mt-4 font-display text-2xl leading-tight sm:text-4xl">
              {e.titre}
            </h3>
            <p data-an className="mt-3 text-soft">
              {e.lieu}
            </p>
            {e.detail && (
              <p data-an className="mt-1 italic text-soft">
                {e.detail}
              </p>
            )}
          </li>
        ))}
      </ol>

      {/* la frise */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-24 z-10 h-px bg-accent/25">
        <div data-fil className="h-[2px] w-full origin-left bg-accent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 pl-4 pr-10 sm:px-8">
        <PiedDePage page="04-05" />
      </div>
    </section>
  );
}
