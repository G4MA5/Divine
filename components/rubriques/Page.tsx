import type { ReactNode } from "react";
import { identite } from "@/content/identite";
import { pad, pageLabel, rubriques } from "@/content/sections";
import type { Couleur } from "@/content/projets";
import { PiedDePage } from "../ui/PiedDePage";
import { TitreAnime } from "../ui/TitreAnime";

/**
 * Mise en page d'une rubrique : une couleur, de grandes illustrations, un titre qui claque,
 * le numéro de page et le pied de page « [div_dev_Now] — p. XX ».
 */
export function Page({
  id,
  titre,
  children,
  className = "",
  sansPied = false,
  couleur = "creme",
  decor,
  large = false,
}: {
  id: string;
  titre?: string;
  children: ReactNode;
  className?: string;
  sansPied?: boolean;
  couleur?: Couleur;
  /** illustrations d'ambiance (des) */
  decor?: ReactNode;
  large?: boolean;
}) {
  const r = rubriques.find((x) => x.id === id)!;
  const num = pageLabel(r).split("-").map((n) => pad(Number(n))).join("-");
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className={`relative overflow-hidden pb-6 pl-4 pr-10 pt-24 sm:px-8 ${className}`}>
      {decor}
      <div className={`relative z-10 mx-auto ${large ? "max-w-5xl" : "max-w-3xl"}`}>
        <p className="label flex justify-between">
          <span>
            {identite.magazine} · {r.titre}
          </span>
          <span className="tabular-nums">p. {num}</span>
        </p>
        <TitreAnime as="h2" id={`${id}-titre`} texte={titre ?? r.titre} className="titre-xl mt-3 text-[clamp(3.4rem,15vw,8rem)]" />
        <hr className="filet mt-5" />
        {children}
        {!sansPied && <PiedDePage page={num} />}
      </div>
    </section>
  );
}
