"use client";

import { useRef } from "react";
import { experiences } from "@/content/experience";
import { identite } from "@/content/identite";
import { PiedDePage } from "../ui/PiedDePage";
import { gsap, ScrollTrigger, PRIO, useScene } from "@/lib/useScene";
import { play, startLoop, stopLoop } from "@/lib/sound";
import { Illu } from "../ui/Illu";

const NB_BARRES = 56;
/** hauteurs d'une onde audio (déterministes, pour éviter tout écart serveur / client) */
const hauteurs = Array.from({ length: NB_BARRES }, (_, i) => {
  const v = Math.abs(Math.sin(i * 0.55) * 0.55 + Math.sin(i * 1.7 + 1) * 0.3 + Math.sin(i * 0.17) * 0.25);
  return Math.max(0.12, Math.min(1, v));
});

function Entete({ ex }: { ex: (typeof experiences)[number] }) {
  return (
    <div>
      <p className="label">{ex.periode}</p>
      <h3 className="titre-xl mt-2 text-5xl sm:text-7xl">{ex.poste}</h3>
      <p className="mt-1 text-lg font-semibold text-soft">
        {ex.entreprise} · {ex.lieu}
      </p>
    </div>
  );
}

/**
 * p. 06-07 — Expérience · motif : la musique
 * Transsion : une onde audio se dessine au scroll, puis ses pics deviennent des lignes de texte (la transcription).
 * Top Telecom Services : un vinyle tourne avec le scroll ; chaque mission est une piste qui s'éclaire.
 * Son : grain de vinyle, seulement pendant cette rubrique.
 */
export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const [transsion, ttsc] = experiences;

  useScene(ref, (root) => {
    /* ───── Transsion : onde → transcription ───── */
    const a = root.querySelector("[data-a]") as HTMLElement;
    const barres = gsap.utils.toArray<HTMLElement>("[data-barre]", a);
    const lignes = gsap.utils.toArray<HTMLElement>("[data-ligne]", a);
    gsap.set(barres, { scaleY: 0, transformOrigin: "50% 50%" });
    gsap.set(lignes, { clipPath: "inset(0 100% 0 0)" });
    const tlA = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: a, start: "top top", end: "+=150%", pin: true, scrub: 0.6, anticipatePin: 1, refreshPriority: PRIO.experience },
    });
    tlA
      .to(barres, { scaleY: 1, stagger: { each: 0.025, from: "start" }, duration: 0.5 }, 0)
      .to(barres, { scaleY: 0.05, stagger: { each: 0.012, from: "start" }, duration: 0.3 }, 1.1)
      .to(lignes, { clipPath: "inset(0 0% 0 0)", stagger: 0.35, duration: 0.5 }, 1.25);
    ScrollTrigger.create({ trigger: a, start: "top 40%", once: true, onEnter: () => play("papier") });

    /* ───── Top Telecom Services : le vinyle ───── */
    const b = root.querySelector("[data-b]") as HTMLElement;
    const disque = b.querySelector("[data-disque]");
    const bras = b.querySelector("[data-bras]");
    const pistes = gsap.utils.toArray<HTMLElement>("[data-piste]", b);
    gsap.set(pistes, { opacity: 0.3 });
    gsap.set(bras, { rotation: -26, transformOrigin: "86% 12%" });
    const tlB = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: b,
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        refreshPriority: PRIO.experience - 1,
        onToggle: (self) => (self.isActive ? startLoop("vinyle") : stopLoop("vinyle")),
      },
    });
    tlB.to(disque, { rotation: 720, transformOrigin: "50% 50%", duration: 3 }, 0).to(bras, { rotation: -6, duration: 3 }, 0);
    pistes.forEach((p, i) => {
      const t = (i / pistes.length) * 3 + 0.1;
      tlB.to(p, { opacity: 1, x: 10, duration: 0.2 }, t).call(() => play("tic"), [], t);
      if (i < pistes.length - 1) tlB.to(p, { opacity: 0.35, x: 0, duration: 0.2 }, ((i + 1) / pistes.length) * 3 + 0.1);
    });
  });

  return (
    <section id="experience" ref={ref} aria-labelledby="experience-titre">
      {/* ───── Transsion ───── */}
      <div data-a data-couleur="jaune" className="relative flex h-svh flex-col justify-center overflow-hidden pb-10 pl-4 pr-10 pt-20 sm:px-8">
        <Illu src="soleil-orange.svg" className="-right-[10%] top-[4%] w-[40vw] max-w-[260px]" anim="respire" />
        <Illu src="nuages.svg" className="-left-[5%] top-[12%] w-[44vw] max-w-[300px]" />
        <Illu src="plante-corail.svg" className="-bottom-[1%] right-[2%] w-[22vw] max-w-[150px]" anim="respire" delai={1} />
        <div className="mx-auto w-full max-w-3xl">
          <p className="label flex justify-between">
            <span>{identite.magazine} · Expérience</span>
            <span className="tabular-nums">p. 06</span>
          </p>
          <h2 id="experience-titre" className="titre-xl mt-3 text-[clamp(3.4rem,15vw,8rem)]">
            Expérience
          </h2>
          <hr className="filet mt-4 mb-8" />
          <Entete ex={transsion} />

          <div className="relative mt-8 h-40 sm:h-52" aria-hidden="true">
            <div className="absolute inset-0 flex items-center gap-[2px]">
              {hauteurs.map((h, i) => (
                <span key={i} data-barre className="flex-1 rounded-full bg-accent" style={{ height: `${Math.round(h * 10000) / 100}%` }} />
              ))}
            </div>
          </div>
          <ul className="-mt-24 space-y-3 sm:-mt-32">
            {transsion.missions.map((m) => (
              <li key={m} data-ligne className="font-display text-lg italic leading-snug sm:text-2xl">
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute inset-x-0 bottom-0 pl-4 pr-10 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <PiedDePage page="06" />
          </div>
        </div>
      </div>

      {/* ───── Top Telecom Services ───── */}
      <div data-b data-couleur="violet" className="relative flex h-svh flex-col justify-center overflow-hidden pb-10 pl-4 pr-10 pt-20 sm:px-8">
        <Illu src="soleil-violet.svg" className="-left-[10%] top-[4%] w-[40vw] max-w-[260px]" anim="respire" />
        <Illu src="etoile.svg" className="right-[6%] top-[12%] w-[7vw] max-w-[40px]" anim="tourne" />
        <Illu src="coeur.svg" className="left-[44%] top-[7%] w-[6vw] max-w-[34px]" anim="flotte" rot={-10} />
        <div className="mx-auto grid w-full max-w-5xl items-center gap-8 sm:grid-cols-2">
          <div>
            <p className="label flex justify-between sm:hidden">
              <span>{identite.magazine} · Expérience</span>
              <span className="tabular-nums">p. 07</span>
            </p>
            <Entete ex={ttsc} />
            <ol className="mt-8 space-y-4">
              {ttsc.missions.map((m, i) => (
                <li key={m} data-piste className="flex gap-3">
                  <span className="label mt-1 tabular-nums !text-accent">Piste {String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-lg italic leading-snug sm:text-xl">{m}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative mx-auto aspect-square w-[min(78vw,26rem)]" aria-hidden="true">
            <svg viewBox="0 0 300 300" className="h-full w-full">
              <g data-disque>
                <circle cx="150" cy="150" r="146" fill="#111" />
                {[134, 124, 114, 104, 94, 84, 74, 64].map((r) => (
                  <circle key={r} cx="150" cy="150" r={r} fill="none" stroke="#2c2c2c" strokeWidth="1.4" />
                ))}
                <path d="M150 4a146 146 0 0 1 130 80" fill="none" stroke="#ffffff" strokeOpacity=".08" strokeWidth="10" />
                <circle cx="150" cy="150" r="42" fill="var(--accent)" />
                <circle cx="150" cy="150" r="5" fill="#111" />
                <text x="150" y="136" textAnchor="middle" fontSize="9" letterSpacing="2" fill="#111" fontFamily="var(--font-inter)">
                  SUPPORT IT
                </text>
                <text x="150" y="170" textAnchor="middle" fontSize="9" letterSpacing="2" fill="#111" fontFamily="var(--font-inter)">
                  TTS · 2026
                </text>
              </g>
              <g data-bras>
                <rect x="186" y="20" width="10" height="150" rx="5" fill="var(--fg)" opacity=".85" />
                <circle cx="266" cy="36" r="16" fill="var(--fg)" opacity=".85" />
                <path d="M266 36L194 150" stroke="var(--fg)" strokeWidth="6" strokeLinecap="round" opacity=".85" />
                <rect x="184" y="146" width="22" height="14" rx="3" fill="var(--accent)" />
              </g>
            </svg>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 pl-4 pr-10 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <PiedDePage page="07" />
          </div>
        </div>
      </div>
    </section>
  );
}
