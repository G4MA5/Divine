"use client";

import { useRef } from "react";
import { experiences } from "@/content/experience";
import { identite } from "@/content/identite";
import { PiedDePage } from "../ui/PiedDePage";
import { TitreAnime } from "../ui/TitreAnime";
import { gsap, ScrollTrigger, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 06-07 — Expérience
 * Chaque expérience est une grande carte « dossier » : elles s'empilent au scroll, la nouvelle glisse par-dessus
 * l'ancienne qui recule et s'estompe. Le poste monte mot à mot, les missions s'écrivent en liste numérotée.
 */
export function Experience() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (root) => {
    const cartes = gsap.utils.toArray<HTMLElement>("[data-carte-xp]", root);

    cartes.forEach((carte, i) => {
      // l'ancienne carte recule quand la suivante arrive
      const suivante = cartes[i + 1];
      if (suivante) {
        gsap.to(carte.querySelector("[data-corps]"), {
          scale: 0.94,
          opacity: 0.45,
          ease: "none",
          scrollTrigger: { trigger: suivante, start: "top 90%", end: "top 20%", scrub: true },
        });
      }
      // les missions apparaissent l'une après l'autre
      const missions = carte.querySelectorAll("[data-mission]");
      if (missions.length) gsap.from(missions, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: { trigger: carte, start: "top 60%", once: true, onEnter: () => play("papier") },
      });
      // le trait sous l'en-tête se trace
      gsap.from(carte.querySelector("[data-trait]"), { scaleX: 0, transformOrigin: "left", duration: 1, ease: "power3.out", scrollTrigger: { trigger: carte, start: "top 70%", once: true } });
    });
    ScrollTrigger.refresh();
  });

  return (
    <section id="experience" ref={ref} aria-labelledby="experience-titre" className="relative bg-white pb-10 pl-4 pr-4 pt-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="label flex justify-between">
          <span>{identite.magazine} · Expérience</span>
          <span className="tabular-nums">p. 06-07</span>
        </p>
        <TitreAnime as="h2" id="experience-titre" texte="Expérience" className="titre-xl mt-3 text-[clamp(3.4rem,15vw,8rem)]" />
        <hr className="filet mt-5" />

        <ol className="mt-10">
          {experiences.map((ex, i) => (
            <li key={ex.id} data-carte-xp className="sticky mb-10 sm:mb-16" style={{ top: `${5 + i * 1.4}rem` }}>
              <article data-corps className="origin-top rounded-2xl border border-ink/15 bg-white p-6 sm:p-10">
                <div className="flex items-start justify-between gap-4">
                  <p className="label">{ex.periode ?? "Engagement"}</p>
                  <p className="font-display text-5xl font-black leading-none text-gold sm:text-7xl tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                </div>
                <div data-trait aria-hidden="true" className="mt-4 h-px bg-ink" />

                <TitreAnime as="h3" texte={ex.poste} className="titre-xl mt-6 text-[clamp(2.4rem,8.5vw,5.6rem)]" />
                <p className="mt-2 font-display text-xl italic sm:text-2xl">
                  {ex.entreprise}
                  {ex.lieu && <span className="not-italic text-soft"> · {ex.lieu}</span>}
                </p>
                {ex.resume && <p className="mt-4 max-w-3xl text-lg leading-snug text-soft">{ex.resume}</p>}
                {ex.lien && (
                  <p className="mt-4">
                    <a href={ex.lien.href} target="_blank" rel="noopener noreferrer" className="btn !px-4 !py-2">
                      {ex.lien.texte} ↗
                    </a>
                  </p>
                )}

                {ex.missions.length > 0 && (
                  <ol className="mt-8 grid gap-4 sm:grid-cols-3">
                    {ex.missions.map((m, j) => (
                      <li key={m} data-mission className="border-t border-ink/20 pt-3">
                        <span className="label tabular-nums !text-accent">{String(j + 1).padStart(2, "0")}</span>
                        <p className="mt-1 text-lg leading-snug">{m}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            </li>
          ))}
        </ol>
        <PiedDePage page="06-07" />
      </div>
    </section>
  );
}
