"use client";

import { useRef } from "react";
import { identite } from "@/content/identite";
import { pad, pageLabel, rubriques } from "@/content/sections";
import { PiedDePage } from "../ui/PiedDePage";
import { allerA } from "../SmoothScroll";
import { gsap, ScrollTrigger, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";
import { Illu } from "../ui/Illu";

/**
 * p. 02 — Sommaire
 * Effet : les lignes sont tapées une à une, comme à la machine à écrire, et les points de conduite
 * se tracent vers le numéro de page. Son : frappe de machine, très douce.
 */
export function Sommaire() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (root) => {
    const lignes = gsap.utils.toArray<HTMLElement>("[data-ligne]", root);
    lignes.forEach((l) => {
      gsap.set(l.querySelectorAll("[data-c]"), { opacity: 0 });
      gsap.set(l.querySelector("[data-lead]"), { scaleX: 0, transformOrigin: "left center" });
      gsap.set(l.querySelectorAll("[data-num], [data-acc]"), { opacity: 0 });
    });

    ScrollTrigger.create({
      trigger: root,
      start: "top 55%",
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        let t = 0.2;
        lignes.forEach((l) => {
          const chars = l.querySelectorAll("[data-c]");
          chars.forEach((c, j) => {
            tl.set(c, { opacity: 1 }, t + j * 0.05);
            if (j % 2 === 0) tl.call(() => play("machine"), [], t + j * 0.05);
          });
          const fin = t + chars.length * 0.05;
          tl.to(l.querySelector("[data-lead]"), { scaleX: 1, duration: 0.5, ease: "power2.out" }, fin)
            .to(l.querySelectorAll("[data-num]"), { opacity: 1, duration: 0.3 }, fin + 0.35)
            .to(l.querySelectorAll("[data-acc]"), { opacity: 1, duration: 0.4 }, fin + 0.1);
          t = fin + 0.35;
        });
      },
    });
  });

  return (
    <section
      id="sommaire"
      data-couleur="coral"
      ref={ref}
      aria-labelledby="sommaire-titre"
      className="relative z-10 -mt-[100svh] min-h-svh overflow-hidden pb-16 pl-4 pr-10 pt-24 sm:px-8"
    >
      <Illu src="soleil-jaune.svg" className="-right-[14%] top-[2%] w-[58vw] max-w-[420px]" anim="respire" vitesse={1.5} />
      <Illu src="avion.svg" className="left-[6%] top-[14%] w-[16vw] max-w-[90px]" anim="flotte" rot={-12} vitesse={-2} />
      <Illu src="nuages.svg" className="left-[-6%] top-[18%] w-[56vw] max-w-[360px]" vitesse={1} />
      <Illu src="plante-jaune.svg" className="-bottom-[1%] -left-[3%] w-[28vw] max-w-[180px]" anim="respire" vitesse={-1} />
      <Illu src="plante-bleue.svg" className="-bottom-[1%] right-[0%] w-[24vw] max-w-[150px]" anim="respire" delai={1.2} vitesse={-1.5} />
      <Illu src="etoile.svg" className="right-[8%] top-[42%] w-[7vw] max-w-[40px]" anim="tourne" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="label flex justify-between !text-fg">
          <span>{identite.magazine} · {identite.numero}</span>
          <span className="tabular-nums">p. 02</span>
        </p>
        <h2 id="sommaire-titre" className="titre-xl mt-3 text-[clamp(4.2rem,19vw,9.5rem)] text-accent [text-shadow:4px_4px_0_#1f2d34]">
          Sommaire
        </h2>
        <hr className="filet mt-6" />
        <ol className="mt-4">
          {rubriques
            .filter((r) => r.id !== "sommaire")
            .map((r) => {
              const num = pageLabel(r).split("-").map((n) => pad(Number(n))).join("-");
              return (
                <li key={r.id} data-ligne>
                  <a
                    href={`#${r.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      play("page");
                      allerA(r.id);
                    }}
                    className="group flex items-baseline gap-3 py-3"
                  >
                    <span className="sr-only">{r.titre}</span>
                    <span aria-hidden="true" className="whitespace-pre font-display text-3xl font-black italic transition-colors group-hover:text-accent sm:text-4xl">
                      {[...r.titre].map((c, i) => (
                        <span key={i} data-c>
                          {c}
                        </span>
                      ))}
                    </span>
                    <span data-lead className="min-w-6 flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-fg/60" aria-hidden="true" />
                    <span data-num className="label tabular-nums !text-fg">
                      p. {num}
                    </span>
                  </a>
                  <p data-acc className="pb-2 font-semibold text-soft">
                    {r.accroche}
                  </p>
                </li>
              );
            })}
        </ol>
        <PiedDePage page={2} />
      </div>
    </section>
  );
}
