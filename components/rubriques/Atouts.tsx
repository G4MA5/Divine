"use client";

import { useRef } from "react";
import { atouts } from "@/content/competences";
import { identite } from "@/content/identite";
import { PiedDePage } from "../ui/PiedDePage";
import { gsap, PRIO, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

const ANGLES = [0, 90, 180, -90];

/**
 * p. 17 — Atouts · motif : le kung-fu
 * Effet : chaque atout arrive comme un coup. La page se fend en deux (découpe nette en diagonale) et le mot
 * apparaît dans l'ouverture, en Playfair très grand. Mouvement net et rapide, élégant, jamais violent.
 * Son : un souffle (« woosh »).
 */
export function Atouts() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (root) => {
    const groupe = root.querySelector("[data-coupe]") as HTMLElement;
    const A = root.querySelector("[data-a]") as HTMLElement;
    const B = root.querySelector("[data-b]") as HTMLElement;
    const mots = gsap.utils.toArray<HTMLElement>("[data-mot]", root);
    const compteur = root.querySelector("[data-n]") as HTMLElement;
    gsap.set(mots, { opacity: 0, scale: 0.9 });
    gsap.set(groupe, { rotation: ANGLES[0] });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: root, start: "top top", end: `+=${atouts.length * 130}%`, pin: true, scrub: 0.5, anticipatePin: 1, refreshPriority: PRIO.atouts },
    });
    const SEG = 3;
    mots.forEach((m, k) => {
      const b = k * SEG;
      tl.set(groupe, { rotation: ANGLES[k % ANGLES.length] }, b)
        .set(compteur, { textContent: `${k + 1} / ${atouts.length}` }, b)
        .call(() => play("woosh"), [], b + 0.3)
        .to(A, { xPercent: -62, yPercent: -62, duration: 0.3, ease: "expo.out" }, b + 0.3)
        .to(B, { xPercent: 62, yPercent: 62, duration: 0.3, ease: "expo.out" }, b + 0.3)
        .fromTo(m, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, b + 0.4)
        .to(m, { opacity: 0, scale: 1.06, duration: 0.3 }, b + 2.2)
        .to(A, { xPercent: 0, yPercent: 0, duration: 0.25, ease: "power4.in" }, b + 2.35)
        .to(B, { xPercent: 0, yPercent: 0, duration: 0.25, ease: "power4.in" }, b + 2.35);
    });
  });

  return (
    <section id="atouts" ref={ref} aria-labelledby="atouts-titre" className="relative h-svh overflow-hidden">
      <h2 id="atouts-titre" className="sr-only">
        Atouts
      </h2>
      {/* les mots, derrière la page */}
      <ul className="absolute inset-0 flex items-center justify-center px-6 pr-12 text-center">
        {atouts.map((a) => (
          <li key={a} data-mot className="absolute max-w-[18ch] font-display text-[clamp(2.4rem,11vw,7.5rem)] font-bold italic leading-[1.02] text-accent sm:max-w-[16ch]">
            {a}
          </li>
        ))}
      </ul>

      {/* la page qui se fend */}
      <div data-coupe aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2">
        <div
          data-a
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
            background: "linear-gradient(to bottom right, var(--bg) 0 calc(50% - 2px), var(--accent) calc(50% - 2px) 50%)",
            filter: "drop-shadow(0 0 18px rgba(0,0,0,.25))",
          }}
        />
        <div data-b className="absolute inset-0 bg-bg" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)", filter: "drop-shadow(0 0 18px rgba(0,0,0,.25))" }} />
      </div>

      {/* l'en-tête reste au-dessus de la page */}
      <div className="absolute inset-x-0 top-0 z-20 pl-4 pr-10 pt-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="label flex justify-between">
            <span>{identite.magazine} · Atouts</span>
            <span className="tabular-nums">p. 17</span>
          </p>
          <p className="mt-3 font-display text-4xl italic leading-none sm:text-6xl">Atouts</p>
          <hr className="filet mt-4" />
          <p data-n className="label mt-3 tabular-nums">
            1 / {atouts.length}
          </p>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 pl-4 pr-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <PiedDePage page="17" />
        </div>
      </div>
    </section>
  );
}
