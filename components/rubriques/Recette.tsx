"use client";

import { useRef } from "react";
import { recette } from "@/content/recette";
import { Page } from "./Page";
import { gsap, ScrollTrigger, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 18 — La Recette · motif : la cuisine
 * Effet : ma méthode de travail présentée comme une recette de magazine culinaire. Au scroll, les ingrédients
 * (mes outils) tombent dans un bol, puis les étapes numérotées s'affichent sur la fiche (temps, difficulté, « pour 1 projet »).
 * Son : léger grésillement.
 */
function Fiche() {
  const ref = useRef<HTMLDivElement>(null);

  useScene(ref, (root) => {
    const chips = gsap.utils.toArray<HTMLElement>("[data-ing]", root);
    const etapes = gsap.utils.toArray<HTMLElement>("[data-etape]", root);

    gsap.fromTo(
      chips,
      { y: (i) => -320 - i * 24, opacity: 0, rotation: (i) => (i % 2 ? 40 : -40) },
      {
        y: 0,
        opacity: 1,
        rotation: (i) => (i % 2 ? 6 : -6) * ((i % 3) + 1) * 0.4,
        ease: "bounce.out",
        stagger: 0.18,
        scrollTrigger: { trigger: root.querySelector("[data-bol]"), start: "top 75%", end: "top 25%", scrub: 0.6 },
      },
    );
    gsap.fromTo(root.querySelector("[data-vapeur]"), { opacity: 0, y: 12 }, { opacity: 0.7, y: -10, scrollTrigger: { trigger: root.querySelector("[data-bol]"), start: "top 35%", end: "top 10%", scrub: true } });
    ScrollTrigger.create({ trigger: root.querySelector("[data-bol]"), start: "top 45%", once: true, onEnter: () => play("gresillement") });

    gsap.fromTo(
      etapes,
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, ease: "none", stagger: 0.5, scrollTrigger: { trigger: root.querySelector("[data-etapes]"), start: "top 80%", end: "bottom 60%", scrub: true } },
    );
  });

  return (
    <div ref={ref}>
      <p className="mt-5 italic text-soft">{recette.sousTitre}</p>

      {/* le bol */}
      <div data-bol className="relative mx-auto mt-10 h-72 w-full max-w-md" aria-hidden="true">
        <div data-vapeur className="absolute left-1/2 top-2 -translate-x-1/2 text-accent">
          <svg viewBox="0 0 80 40" className="h-8 w-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 38c-8-8 8-14 0-22M40 38c-8-8 8-14 0-22M66 38c-8-8 8-14 0-22" />
          </svg>
        </div>
        <svg viewBox="0 0 400 200" className="absolute inset-x-0 bottom-0 z-0 w-full">
          <ellipse cx="200" cy="70" rx="168" ry="30" fill="var(--bg-deep)" stroke="var(--accent)" strokeWidth="2" />
        </svg>
        <ul className="absolute inset-x-6 bottom-16 z-10 flex flex-wrap justify-center gap-2">
          {recette.ingredients.map((x) => (
            <li key={x} data-ing className="border border-accent bg-bg px-3 py-1 font-display italic">
              {x}
            </li>
          ))}
        </ul>
        <svg viewBox="0 0 400 200" className="absolute inset-x-0 bottom-0 z-20 w-full">
          <path d="M32 70C40 160 120 190 200 190s160-30 168-120C320 96 80 96 32 70Z" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2" />
          <path d="M80 110c40 18 200 18 240 0" fill="none" stroke="var(--accent)" strokeOpacity=".35" strokeWidth="1.5" />
        </svg>
      </div>

      {/* la fiche recette */}
      <section aria-label="Fiche recette" className="mt-8 border-2 border-accent p-5 sm:p-8">
        <dl className="grid grid-cols-3 gap-3 border-b border-accent/50 pb-4 text-center">
          {(
            [
              ["Préparation", recette.temps],
              ["Difficulté", recette.difficulte],
              ["Pour", recette.pour],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="label !text-[0.6rem]">{k}</dt>
              <dd className="mt-1 font-display text-base italic leading-snug sm:text-lg">{v}</dd>
            </div>
          ))}
        </dl>
        <h3 className="label mt-5 !text-accent">Ingrédients</h3>
        <p className="mt-1">{recette.ingredients.join(" · ")}</p>
        <h3 className="label mt-6 !text-accent">Préparation</h3>
        <ol data-etapes className="mt-3 space-y-4">
          {recette.etapes.map((e, i) => (
            <li key={i} data-etape className="flex gap-4">
              <span className="font-display text-4xl italic leading-none text-accent tabular-nums">{i + 1}</span>
              <span>{e}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function Recette() {
  return (
    <Page id="recette" titre="La Recette">
      <Fiche />
    </Page>
  );
}
