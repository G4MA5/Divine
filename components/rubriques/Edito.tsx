"use client";

import { useRef } from "react";
import { edito } from "@/content/edito";
import { Page } from "./Page";
import { gsap, ScrollTrigger, mots, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 03 — Édito · motif : la lecture
 * Effet : le texte se révèle mot par mot au rythme du scroll, comme de l'encre qui sèche
 * (opacité + léger flou qui se dissipe). Lettrine dorée, signature manuscrite à la fin.
 * Le marque-page descend le long de la marge, un petit ruban de livre pend en haut.
 */
function Contenu() {
  const ref = useRef<HTMLDivElement>(null);
  const paragraphes = edito.texte.split(/\n\n+/);

  useScene(ref, (root) => {
    const ws = gsap.utils.toArray<HTMLElement>("[data-w]", root);
    gsap.fromTo(
      ws,
      { opacity: 0.1, filter: "blur(7px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        ease: "none",
        stagger: 0.12,
        scrollTrigger: { trigger: root.querySelector("[data-texte]"), start: "top 80%", end: "bottom 45%", scrub: true },
      },
    );

    // le marque-page de la marge
    gsap.fromTo(
      root.querySelector("[data-marge]"),
      { scaleY: 0.04 },
      { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: root, start: "top 70%", end: "bottom 60%", scrub: true } },
    );

    // le ruban de livre qui pend en haut : un léger balancement à l'entrée
    gsap.fromTo(
      root.querySelector("[data-ruban]"),
      { rotation: -9, transformOrigin: "top center" },
      { rotation: 0, duration: 2.2, ease: "elastic.out(1,0.35)", scrollTrigger: { trigger: root, start: "top 75%", once: true } },
    );

    // la signature s'écrit de gauche à droite
    gsap.fromTo(
      root.querySelector("[data-signature]"),
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", ease: "none", scrollTrigger: { trigger: root.querySelector("[data-signature]"), start: "top 90%", end: "top 55%", scrub: true } },
    );

    ScrollTrigger.create({ trigger: root, start: "top 65%", once: true, onEnter: () => play("papier") });
  });

  return (
    <div ref={ref} className="relative mt-10">
      {/* ruban de livre */}
      <svg data-ruban aria-hidden="true" viewBox="0 0 24 90" className="absolute -top-10 right-2 h-[72px] w-5 sm:right-6">
        <path d="M0 0h24v90l-12-14L0 90Z" fill="var(--accent)" />
      </svg>
      {/* marque-page dans la marge */}
      <div aria-hidden="true" className="absolute -left-3 bottom-0 top-0 w-px sm:-left-6">
        <div data-marge className="h-full w-[3px] -translate-x-px bg-accent" />
      </div>

      <div data-texte className="max-w-2xl">
        {paragraphes.map((p, i) => (
          <p key={i} className={`mb-6 ${i === 0 ? "lettrine" : ""}`}>
            {mots(p).map((w, j) => (
              <span key={j} data-w className="inline-block">
                {w}
                {" "}
              </span>
            ))}
          </p>
        ))}
      </div>

      <p data-signature aria-label={`Signature : ${edito.signature}`} className="mt-4 font-signature text-6xl text-accent sm:text-7xl">
        {edito.signature}
      </p>
    </div>
  );
}

export function Edito() {
  return (
    <Page id="edito">
      <Contenu />
    </Page>
  );
}
