"use client";

import { useRef } from "react";
import { identite } from "@/content/identite";
import { pad, pageLabel, rubriques } from "@/content/sections";
import { PiedDePage } from "../ui/PiedDePage";
import { allerA } from "../SmoothScroll";
import { gsap, ScrollTrigger, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";
/**
 * p. 02 — Sommaire
 * Effet : les lignes se tapent à la machine À MESURE QUE LE VISITEUR DÉFILE (le son suit le scroll), et les points de conduite
 * se tracent vers le numéro de page. Son : frappe de machine, très douce.
 */
export function Sommaire() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (root) => {
    const lignes = gsap.utils.toArray<HTMLElement>("[data-ligne]", root);
    const struct = lignes.map((l) => ({
      chars: [...l.querySelectorAll<HTMLElement>("[data-c]")],
      lead: l.querySelector<HTMLElement>("[data-lead]")!,
      fin: [...l.querySelectorAll<HTMLElement>("[data-num], [data-acc]")],
    }));
    const total = struct.reduce((n, l) => n + l.chars.length, 0);
    struct.forEach((l) => {
      l.chars.forEach((c) => (c.style.opacity = "0"));
      gsap.set(l.lead, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(l.fin, { opacity: 0 });
    });

    // la frappe suit le scroll : chaque lettre apparaît quand le visiteur descend, et le son ne joue que pendant qu'il défile
    const rendre = (n: number) => {
      let debut = 0;
      struct.forEach((l) => {
        const k = l.chars.length;
        const fait = Math.max(0, Math.min(k, n - debut));
        l.chars.forEach((c, i) => (c.style.opacity = i < fait ? "1" : "0"));
        gsap.set(l.lead, { scaleX: fait / k });
        gsap.set(l.fin, { opacity: fait >= k ? 1 : 0 });
        debut += k;
      });
    };
    // La frappe SUIT le scroll sans jamais sauter : le visiteur fixe jusqu'où le texte doit être écrit,
    // et la machine rattrape ce point lettre après lettre (jamais d'un coup). Dès qu'elle l'a atteint, elle s'arrête,
    // et le son avec elle : rien ne continue tant que le visiteur ne redescend pas.
    let cible = 0;
    let ecrit = 0;
    let acc = 0;
    ScrollTrigger.create({
      trigger: root,
      start: "top 75%",
      end: "bottom 80%",
      onUpdate: (self) => {
        cible = Math.round(self.progress * total);
      },
    });
    const VITESSE = 38; // lettres par seconde, au maximum
    const tick = () => {
      const dt = Math.min(0.1, gsap.ticker.deltaRatio() / 60);
      if (ecrit === cible) {
        acc = 0;
        return;
      }
      acc += dt * VITESSE;
      const pas = Math.floor(acc);
      if (pas < 1) return;
      acc -= pas;
      const avant = ecrit;
      ecrit = cible > ecrit ? Math.min(cible, ecrit + pas) : Math.max(cible, ecrit - pas * 3);
      rendre(ecrit);
      if (ecrit > avant) play("machine");
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  });

  return (
    <section
      id="sommaire"

      ref={ref}
      aria-labelledby="sommaire-titre"
      className="relative z-10 -mt-[100svh] min-h-svh overflow-hidden pb-16 pl-4 pr-10 pt-24 sm:px-8"
    >
      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="label flex justify-between !text-fg">
          <span>{identite.magazine} · {identite.numero}</span>
          <span className="tabular-nums">p. 02</span>
        </p>
        <h2 id="sommaire-titre" className="titre-xl mt-3 text-[clamp(4.2rem,19vw,9.5rem)] text-fg">
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
                    <span aria-hidden="true" className="whitespace-pre font-display text-3xl font-black italic transition-colors group-hover:text-fg sm:text-4xl">
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
