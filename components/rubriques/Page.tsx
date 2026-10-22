"use client";

import { useContenu } from "@/components/ContenuProvider";
import type { ReactNode } from "react";
import { pad, pageLabel, rubriques } from "@/content/sections";
import { PiedDePage } from "../ui/PiedDePage";
import { TitreAnime } from "../ui/TitreAnime";
import { Gribouillis } from "../ui/Effets";

/**
 * Mise en page d'une rubrique : un mot-filigrane géant derrière (il glisse au scroll), le numéro de page, un titre dont
 * les mots montent depuis la ligne de base, et le pied de page « [div_dev_Now] — p. XX ».
 */
export function Page({
  id,
  titre,
  children,
  className = "",
  sansPied = false,
  large = false,
  trait = false,
}: {
  id: string;
  titre?: string;
  children: ReactNode;
  className?: string;
  sansPied?: boolean;
  large?: boolean;
  /** un trait doré dessiné à la main sous le titre */
  trait?: boolean;
}) {
  const { identite } = useContenu();
  const r = rubriques.find((x) => x.id === id)!;
  const num = pageLabel(r).split("-").map((n) => pad(Number(n))).join("-");
  const filigrane = (titre ?? r.titre).split(" ").slice(-1)[0].toUpperCase();
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className={`relative overflow-hidden bg-white pb-6 pl-4 pr-4 pt-24 sm:px-8 ${className}`}>
      <span aria-hidden="true" data-filigrane className="pointer-events-none absolute left-0 top-10 select-none whitespace-nowrap font-display text-[clamp(10rem,32vw,30rem)] font-black leading-none text-ink/[0.035]">
        {filigrane}
      </span>
      <div className={`relative z-10 mx-auto ${large ? "max-w-5xl" : "max-w-3xl"}`}>
        <p className="label flex justify-between">
          <span>
            {identite.magazine} · {r.titre}
          </span>
          <span className="tabular-nums">p. {num}</span>
        </p>
        <TitreAnime as="h2" id={`${id}-titre`} texte={titre ?? r.titre} className="titre-xl mt-3 text-[clamp(3.4rem,15vw,8rem)]" />
        {trait && <Gribouillis className="mt-5" />}
        <hr className="filet mt-5" />
        {children}
        {!sansPied && <PiedDePage page={num} />}
      </div>
    </section>
  );
}
