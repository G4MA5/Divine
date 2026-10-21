import type { CSSProperties } from "react";
import type { Projet } from "@/content/projets";
import { ARTS } from "./CoverArt";

/** La couverture d'un dossier, façon magazine : page saturée, titre didone, grandes lignes fines. */
export function CouvertureProjet({ p, numero }: { p: Projet; numero: number }) {
  const Art = ARTS[p.couverture.art];
  const c = p.couverture;
  const n = String(numero).padStart(2, "0");
  return (
    <span className={`vc vc--${c.theme} vc--${c.disposition}${c.chevauche ? " vc--overlap" : ""}`} style={{ ["--t" as string]: p.tailleTitre } as CSSProperties}>
      <Art />
      <span className="vc-mast">{p.titre}</span>
      <span className="vc-sub">N°{n}</span>
      <span className="vc-credit">{c.credit}</span>
      <span className="vc-big">
        {c.grand.map((l) => (
          <span key={l.t} className={l.accent ? "acc" : undefined}>
            {l.t}
          </span>
        ))}
      </span>
      <span className="vc-tiny">
        {c.petit.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </span>
    </span>
  );
}
