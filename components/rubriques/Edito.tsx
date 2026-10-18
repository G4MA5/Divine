"use client";

import { useRef } from "react";
import { edito } from "@/content/edito";
import { Page } from "./Page";
import { Portrait } from "../ui/Portrait";
import { Illu } from "../ui/Illu";
import { gsap, ScrollTrigger, mots, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 03 — Édito · motif : la lecture
 * Effet : le texte se révèle mot par mot au rythme du scroll, comme de l'encre qui sèche (opacité + léger flou
 * qui se dissipe). Lettrine, signature manuscrite à la fin, marque-page dans la marge.
 * Ta photo se pose sur un grand soleil qui tourne doucement. Son : froissement de papier.
 */
function Contenu() {
  const ref = useRef<HTMLDivElement>(null);
  const paragraphes = edito.texte.split(/\n\n+/);

  useScene(ref, (root) => {
    const ws = gsap.utils.toArray<HTMLElement>("[data-w]", root);
    gsap.fromTo(
      ws,
      { opacity: 0.12, filter: "blur(7px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        ease: "none",
        stagger: 0.12,
        scrollTrigger: { trigger: root.querySelector("[data-texte]"), start: "top 80%", end: "bottom 45%", scrub: true },
      },
    );

    // le marqueur surligne la conviction, mot après mot
    gsap.fromTo(
      root.querySelector("[data-marqueur]"),
      { backgroundSize: "0% 100%" },
      { backgroundSize: "100% 100%", ease: "none", scrollTrigger: { trigger: root.querySelector("[data-marqueur]"), start: "top 85%", end: "top 55%", scrub: true } },
    );

    // le soleil tourne avec le scroll, la photo arrive du bas
    gsap.fromTo(root.querySelector("[data-rayons]"), { rotation: -30 }, { rotation: 30, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(
      root.querySelector("[data-photo]"),
      { y: 90, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%", once: true } },
    );

    // le marque-page de la marge
    gsap.fromTo(
      root.querySelector("[data-marge]"),
      { scaleY: 0.04 },
      { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: root, start: "top 70%", end: "bottom 60%", scrub: true } },
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
    <div ref={ref} className="relative mt-10 grid items-center gap-10 sm:grid-cols-[1fr_0.9fr]">
      {/* marque-page dans la marge */}
      <div aria-hidden="true" className="absolute -left-3 bottom-0 top-0 hidden w-px sm:-left-6 sm:block">
        <div data-marge className="h-full w-[4px] -translate-x-px bg-coral" />
      </div>

      {/* la photo, sur son soleil */}
      <div className="relative order-first mx-auto w-[78%] max-w-sm sm:order-last sm:w-full">
        <div data-rayons aria-hidden="true" className="absolute left-1/2 top-[8%] aspect-square w-[118%] -translate-x-1/2 rounded-full" style={{ background: "repeating-conic-gradient(from 0deg, #ffc727 0 7deg, #ffd95e 7deg 14deg)" }} />
        <div aria-hidden="true" className="absolute left-1/2 top-[14%] aspect-square w-[92%] -translate-x-1/2 rounded-full bg-yellow" />
        <div data-photo className="relative">
          <Portrait className="relative z-10 mx-auto h-auto w-[84%] drop-shadow-[6px_8px_0_rgba(31,45,52,.35)]" />
        </div>
        <span className="label absolute -bottom-2 left-1/2 z-20 -translate-x-1/2 -rotate-3 whitespace-nowrap border-2 border-ink bg-coral px-3 py-2 !text-ink shadow-[3px_3px_0_#1f2d34]">
          Divine, à Abidjan
        </span>
      </div>

      <div>
        <div data-texte className="max-w-2xl">
          {paragraphes.map((p, i) => {
            const dernier = i === paragraphes.length - 1;
            return (
              <p key={i} className={`mb-6 text-[1.25em] font-semibold leading-snug ${i === 0 ? "lettrine" : ""}`}>
                {dernier ? (
                  <span data-marqueur className="box-decoration-clone px-1 [background:linear-gradient(transparent_18%,#ffc727_18%,#ffc727_92%,transparent_92%)_no-repeat] [background-size:0%_100%]">
                    {mots(p).map((w, j) => (
                      <span key={j} data-w className="inline-block">
                        {w}
                        {" "}
                      </span>
                    ))}
                  </span>
                ) : (
                  mots(p).map((w, j) => (
                    <span key={j} data-w className="inline-block">
                      {w}
                      {" "}
                    </span>
                  ))
                )}
              </p>
            );
          })}
        </div>
        <p data-signature aria-label={`Signature : ${edito.signature}`} className="mt-2 font-signature text-7xl text-[#e8452f] sm:text-8xl">
          {edito.signature}
        </p>
      </div>
    </div>
  );
}

export function Edito() {
  return (
    <Page
      id="edito"
      couleur="creme"
      large
      decor={
        <>
          <Illu src="soleil-orange.svg" className="-left-[8%] top-[6%] w-[34vw] max-w-[220px]" anim="respire" vitesse={1.5} />
          <Illu src="etoile.svg" className="right-[6%] top-[9%] w-[8vw] max-w-[44px]" anim="tourne" />
          <Illu src="coeur.svg" className="left-[44%] top-[3%] w-[7vw] max-w-[36px]" anim="flotte" rot={12} />
          <Illu src="plante-corail.svg" className="-bottom-[1%] -left-[2%] w-[24vw] max-w-[150px]" anim="respire" vitesse={-1} />
          <Illu src="oiseaux.svg" className="right-[2%] top-[28%] w-[20vw] max-w-[120px]" anim="flotte" vitesse={-2} />
        </>
      }
    >
      <Contenu />
    </Page>
  );
}
