import Link from "next/link";
import type { Projet } from "@/content/projets";
import { CouvertureProjet } from "./CouvertureProjet";

/**
 * Le contenu d'un dossier : la couverture à gauche, le texte à droite.
 * N'affiche que ce qui est renseigné (rien n'est inventé, rien ne reste vide).
 */
export function DossierContenu({ projet, numero, niveau = 3, lien = false }: { projet: Projet; numero: number; niveau?: 1 | 2 | 3; lien?: boolean }) {
  const H = `h${niveau}` as "h1" | "h2" | "h3";
  const fiche = (
    [
      ["Date", projet.date],
      ["Équipe", projet.equipe],
      ["Rôle", projet.role],
      ["Statut", projet.statut],
      ["Lien", projet.lien],
    ] as const
  ).filter(([, v]) => !!v);

  return (
    <article className="grid gap-8 sm:grid-cols-[minmax(0,19rem)_1fr] sm:gap-12">
      <div className="mx-auto w-full max-w-[19rem]">
        <CouvertureProjet p={projet} numero={numero} />
      </div>

      <div>
        <p className="label">
          Dossier · N°{String(numero).padStart(2, "0")} — {projet.rubrique}
        </p>
        <H data-titre-dossier className="titre-xl mt-3 text-[clamp(2.8rem,8vw,5.5rem)]">
          {projet.titre}
        </H>
        <p className="mt-4 font-display text-xl italic leading-snug sm:text-2xl">{projet.chapo}</p>
        <p className="mt-4">{projet.description}</p>

        {projet.fonctionnalites.length > 0 && (
          <ul className="mt-6 grid gap-x-8 gap-y-1 sm:grid-cols-2" aria-label="Fonctionnalités">
            {projet.fonctionnalites.map((f) => (
              <li key={f} className="flex gap-3 border-t border-ink/15 py-2 text-lg leading-snug">
                <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {f}
              </li>
            ))}
          </ul>
        )}

        {projet.stack.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
            {projet.stack.map((t) => (
              <li key={t} className="rounded-full border border-ink/25 px-3 py-1 font-sans text-[0.7rem] font-semibold">
                {t}
              </li>
            ))}
          </ul>
        )}

        {fiche.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-ink pt-4 sm:grid-cols-3">
            {fiche.map(([k, v]) => (
              <div key={k}>
                <dt className="label !text-[0.6rem]">{k}</dt>
                <dd className="font-display text-lg italic leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {lien && (
          <p className="mt-8">
            <Link href={`/reportages/${projet.slug}`} className="btn">
              Ouvrir la page →
            </Link>
          </p>
        )}
      </div>
    </article>
  );
}
