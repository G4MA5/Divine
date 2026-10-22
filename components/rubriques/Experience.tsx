"use client";

import { useContenu } from "@/components/ContenuProvider";

import Image from "next/image";
import { experiences, type Experience as Xp } from "@/content/experience";
import { PiedDePage } from "../ui/PiedDePage";
import { TitreAnime } from "../ui/TitreAnime";
import ScrollStack, { ScrollStackItem } from "../reactbits/ScrollStack";

/**
 * p. 06-07 — Expérience
 * Les expériences s'empilent comme des cartes (React Bits « Scroll Stack ») : chaque carte garde sa couleur et son logo,
 * la suivante vient la recouvrir pendant que la précédente recule légèrement. Les cartes sont assez courtes pour
 * rester lisibles en entier une fois en place.
 */

function Marque({ ex }: { ex: Xp }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 sm:h-16 sm:w-16"
      style={{ boxShadow: `inset 0 0 0 2px ${ex.accent}` }}
    >
      {ex.logo ? (
        <Image src={ex.logo} alt="" width={64} height={64} className="h-full w-full object-contain" />
      ) : (
        <span className="font-display text-xl font-black leading-none sm:text-2xl" style={{ color: ex.accent }}>
          {ex.monogramme}
        </span>
      )}
    </span>
  );
}

function Carte({ ex, i }: { ex: Xp; i: number }) {
  return (
    <ScrollStackItem itemClassName="!h-auto !rounded-3xl !p-6 sm:!p-9" style={{ background: ex.fond }}>
      <article aria-label={`${ex.poste}, ${ex.entreprise}`}>
        <div className="flex items-center gap-4">
          <Marque ex={ex} />
          <div className="min-w-0 flex-1">
            <p className="label !text-ink/70">{ex.periode ?? "Engagement"}</p>
            <p className="font-display text-lg italic leading-tight sm:text-xl">
              {ex.entreprise}
              {ex.lieu && <span className="not-italic text-ink/60"> · {ex.lieu}</span>}
            </p>
          </div>
          <p className="font-display text-5xl font-black leading-none tabular-nums sm:text-7xl" style={{ color: ex.accent }}>
            {String(i + 1).padStart(2, "0")}
          </p>
        </div>

        <h3 className="titre-xl mt-5 text-[clamp(1.9rem,6vw,4rem)] !leading-[1.02]">{ex.poste}</h3>
        {ex.resume && <p className="mt-3 max-w-3xl text-base leading-snug text-ink/80 sm:text-lg">{ex.resume}</p>}

        {ex.missions.length > 0 && (
          <ol className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-5">
            {ex.missions.map((m, j) => (
              <li key={m} className="border-t pt-2" style={{ borderColor: ex.accent }}>
                <span className="label tabular-nums" style={{ color: ex.accent }}>
                  {String(j + 1).padStart(2, "0")}
                </span>
                <p className="mt-0.5 text-[0.95rem] leading-snug sm:text-base">{m}</p>
              </li>
            ))}
          </ol>
        )}

        {ex.lien && (
          <p className="mt-5">
            <a href={ex.lien.href} target="_blank" rel="noopener noreferrer" className="btn !px-4 !py-2">
              {ex.lien.texte} ↗
            </a>
          </p>
        )}
      </article>
    </ScrollStackItem>
  );
}

export function Experience() {
  const { identite, experiences } = useContenu();
  return (
    <section id="experience" aria-labelledby="experience-titre" className="relative bg-white pb-10 pl-4 pr-4 pt-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="label flex justify-between">
          <span>{identite.magazine} · Expérience</span>
          <span className="tabular-nums">p. 06-07</span>
        </p>
        <TitreAnime as="h2" id="experience-titre" texte="Expérience" className="titre-xl mt-3 text-[clamp(3.4rem,15vw,8rem)]" />
        <hr className="filet mt-5" />

        <div className="mt-8">
          <ScrollStack
            useWindowScroll
            smoothScroll={false}
            stackPosition="11%"
            itemDistance={200}
            itemStackDistance={22}
            itemScale={0.025}
            baseScale={0.9}
            dimAmount={0.05}
            holdDistance={160}
            className="!px-0"
          >
            {experiences.map((ex, i) => (
              <Carte key={ex.id} ex={ex} i={i} />
            ))}
          </ScrollStack>
        </div>
        <PiedDePage page="06-07" />
      </div>
    </section>
  );
}
