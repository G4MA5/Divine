import type { ReactNode } from "react";
import { identite } from "@/content/identite";
import { pad, pageLabel, rubriques } from "@/content/sections";
import { PiedDePage } from "../ui/PiedDePage";

/** Mise en page d'une rubrique : numéro de page, titre, pied de page « [div_dev_Now] — p. XX ». */
export function Page({
  id,
  titre,
  children,
  className = "",
  sansPied = false,
  titreCache = false,
}: {
  id: string;
  titre?: string;
  children: ReactNode;
  className?: string;
  sansPied?: boolean;
  titreCache?: boolean;
}) {
  const r = rubriques.find((x) => x.id === id)!;
  const num = pageLabel(r).split("-").map((n) => pad(Number(n))).join("-");
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className={`relative pb-6 pl-4 pr-10 pt-20 sm:px-8 ${className}`}>
      <div className="mx-auto max-w-3xl">
        <p className="label flex justify-between">
          <span>{identite.magazine} · {r.titre}</span>
          <span className="tabular-nums">p. {num}</span>
        </p>
        <h2 id={`${id}-titre`} className={titreCache ? "sr-only" : "mt-3 font-display text-5xl italic leading-[1.02] sm:text-7xl"}>
          {titre ?? r.titre}
        </h2>
        <hr className="filet mt-5" />
        {children}
        {!sansPied && <PiedDePage page={num} />}
      </div>
    </section>
  );
}
