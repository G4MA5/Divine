"use client";

import { useRef } from "react";
import { atouts } from "@/content/competences";
import { identite } from "@/content/identite";
import { gsap, PRIO, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";
import { Illu } from "../ui/Illu";

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
    <section id="atouts" ref={ref} data-couleur="nuit" aria-labelledby="atouts-titre" className="relative h-svh overflow-hidden">
      <Illu src="soleil-rose.svg" className="-left-[8%] bottom-[8%] w-[34vw] max-w-[230px]" anim="respire" />
      <Illu src="soleil-jaune.svg" className="-right-[8%] top-[34%] w-[30vw] max-w-[200px]" anim="respire" delai={1.5} />
      <Illu src="etoile.svg" className="left-[18%] top-[30%] w-[6vw] max-w-[34px]" anim="tourne" />
      <h2 id="atouts-titre" className="sr-only">
        Atouts
      </h2>
      {/* les mots, derrière la page */}
      <ul className="absolute inset-0 flex items-center justify-center px-6 pr-12 text-center">
        {atouts.map((a) => (
          <li key={a} data-mot className="titre-xl absolute z-[1] max-w-[14ch] text-[clamp(2.8rem,13vw,8.5rem)] text-yellow [text-shadow:5px_5px_0_#ff725e] sm:max-w-[16ch]">
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
            background: "linear-gradient(to bottom right, #ff725e 0 calc(50% - 4px), #fff6ec calc(50% - 4px) 50%)",
            filter: "drop-shadow(0 0 18px rgba(0,0,0,.25))",
          }}
        />
        <div data-b className="absolute inset-0" style={{ background: "#ff725e", clipPath: "polygon(100% 0, 100% 100%, 0 100%)", filter: "drop-shadow(0 0 18px rgba(0,0,0,.25))" }} />
      </div>

      {/* l'en-tête reste au-dessus de la page */}
      <div className="absolute inset-x-0 top-0 z-20 pl-4 pr-10 pt-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-block border-[3px] border-ink bg-paper px-4 py-3 text-ink shadow-[5px_5px_0_#1f2d34]">
            <p className="label !text-ink">
              {identite.magazine} · Atouts · p. 17
            </p>
            <p className="titre-xl mt-1 text-5xl sm:text-7xl">Atouts</p>
            <p data-n className="label mt-1 tabular-nums !text-ink">
              1 / {atouts.length}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 pl-4 pr-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="label mb-3 flex justify-between !text-ink">
            <span className="bg-paper px-2 py-1">{identite.magazine}</span>
            <span className="bg-paper px-2 py-1 tabular-nums">p. 17</span>
          </p>
        </div>
      </div>
    </section>
  );
}
