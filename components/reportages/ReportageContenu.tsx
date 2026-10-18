/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Projet } from "@/content/projets";
import { Illu } from "../ui/Illu";

/** Un reportage en double page : logo, titre, chapô, « photos de presse » avec légendes, fiche technique encadrée. */
export function ReportageContenu({
  projet,
  compact = false,
  niveau = 3,
  page,
  lien = false,
}: {
  projet: Projet;
  compact?: boolean;
  niveau?: 1 | 2 | 3;
  page?: string;
  lien?: boolean;
}) {
  const H = `h${niveau}` as "h1" | "h2" | "h3";
  const captures = projet.captures.length ? projet.captures : [null, null];

  return (
    <article className="relative mx-auto w-full max-w-3xl">
      <Illu src={projet.illu} className={`-top-6 right-[-4%] z-0 ${compact ? "w-[30vw] max-w-[130px] sm:max-w-[190px]" : "w-[34vw] max-w-[220px]"}`} anim="flotte" rot={6} />

      <p className="label relative z-10 flex justify-between !text-fg">
        <span>Reportage · {projet.rubrique}</span>
        {page && <span className="tabular-nums">p. {page}</span>}
      </p>

      <div className="relative z-10 mt-3 flex items-center gap-4">
        {projet.logo && (
          <img
            src={`/images/logos/${projet.logo}`}
            alt={`Logo ${projet.titre}`}
            className={`h-auto rounded-xl border-2 border-ink bg-white object-contain p-1.5 shadow-[3px_3px_0_#1f2d34] ${compact ? "w-16 sm:w-24" : "w-24 sm:w-32"}`}
          />
        )}
        <H className={`titre-xl ${compact ? "text-[clamp(2.6rem,11vw,5.2rem)]" : "text-[clamp(3.2rem,14vw,7rem)]"}`}>{projet.titre}</H>
      </div>

      <p className={`relative z-10 mt-3 font-semibold italic ${compact ? "line-clamp-4 text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}>{projet.chapo}</p>
      <hr className="filet relative z-10 mt-4" />

      <div className={`relative z-10 grid sm:grid-cols-[1.1fr_1fr] ${compact ? "mt-4 gap-4" : "mt-8 gap-8"}`}>
        <div className="grid gap-3">
          <p className={compact ? "line-clamp-4 text-base sm:text-lg" : ""}>{projet.description}</p>

          {projet.fonctionnalites.length > 0 && (
            <ul className={`flex flex-wrap gap-2 ${compact ? "max-h-[5.5rem] overflow-hidden" : ""}`} aria-label="Fonctionnalités">
              {projet.fonctionnalites.map((f) => (
                <li key={f} className="border-2 border-fg bg-paper px-2.5 py-1 font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-ink">
                  {f}
                </li>
              ))}
            </ul>
          )}

          {/* photos de presse */}
          <div className={`grid grid-cols-2 gap-3 ${compact ? "hidden [@media(min-height:880px)]:grid" : ""}`}>
            {captures.map((c, i) => (
              <figure key={i}>
                <div className="flex aspect-[4/3] items-center justify-center border-2 border-fg bg-bg-deep p-2 text-center shadow-[3px_3px_0_var(--fg)]">
                  <span className="label !normal-case !tracking-normal !text-fg">{c ?? "[À FOURNIR : capture d'écran]"}</span>
                </div>
                <figcaption className="label mt-2 !text-[0.6rem] !text-fg">
                  Fig. {i + 1} — {projet.titre}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* encadré : la fiche technique */}
        <aside aria-label="Fiche technique" className="self-start border-[3px] border-fg bg-paper p-4 text-ink shadow-[6px_6px_0_var(--fg)]">
          <h4 className="label !text-[#e8452f]">Fiche technique</h4>
          <dl className="mt-3 space-y-2 text-base">
            {(
              [
                ["Stack", projet.stack.join(" · ")],
                ...(projet.date ? ([["Date", projet.date]] as const) : []),
                ["Rôle", projet.role],
                ["Équipe", projet.equipe],
                ["Statut", projet.statut],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="label !text-[0.6rem] !text-ink/60">{k}</dt>
                <dd className="font-display font-bold italic leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          {projet.lien && (
            <p className="mt-3 border-t-2 border-ink/20 pt-3 text-sm">
              <span className="label !text-[0.6rem] !text-ink/60">Lien</span>
              <br />
              {projet.lien}
            </p>
          )}
        </aside>
      </div>

      {lien && (
        <p className="relative z-10 mt-5">
          <Link href={`/reportages/${projet.slug}`} className="btn btn-plein">
            Lire le reportage →
          </Link>
        </p>
      )}
    </article>
  );
}
