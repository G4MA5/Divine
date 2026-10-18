import Link from "next/link";
import type { Projet } from "@/content/projets";

/** Un reportage en double page : titre, chapô, « photos de presse » avec légendes, fiche technique dorée. */
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
    <article className="mx-auto w-full max-w-3xl">
      <p className="label flex justify-between">
        <span>Reportage · {projet.rubrique}</span>
        {page && <span className="tabular-nums">p. {page}</span>}
      </p>
      <H className={`mt-2 font-display italic leading-[1.02] ${compact ? "text-4xl sm:text-6xl" : "text-5xl sm:text-7xl"}`}>{projet.titre}</H>
      <p className={`mt-3 italic text-soft ${compact ? "line-clamp-4 text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}>{projet.chapo}</p>
      <hr className="filet mt-4" />

      <div className={compact ? "mt-4 grid gap-4 sm:grid-cols-[1.1fr_1fr]" : "mt-8 grid gap-8 sm:grid-cols-[1.1fr_1fr]"}>
        <div className="grid gap-3">
          <p className={compact ? "line-clamp-5 text-base sm:text-lg" : ""}>{projet.description}</p>
          {/* photos de presse */}
          <div className={`grid grid-cols-2 gap-3 ${compact ? "hidden [@media(min-height:700px)]:grid" : ""}`}>
            {captures.map((c, i) => (
              <figure key={i}>
                <div className="flex aspect-[4/3] items-center justify-center border border-accent/50 bg-bg-deep p-2 text-center">
                  <span className="label !normal-case !tracking-normal">{c ?? "[À FOURNIR : capture d'écran]"}</span>
                </div>
                <figcaption className="label mt-1 !text-[0.6rem]">Fig. {i + 1} — {projet.titre}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* encadré doré */}
        <aside aria-label="Fiche technique" className="self-start border-2 border-accent p-4">
          <h4 className="label !text-accent">Fiche technique</h4>
          <dl className="mt-3 space-y-2 text-base">
            {(
              [
                ["Stack", projet.stack.join(" · ")],
                ["Rôle", projet.role],
                ["Équipe", projet.equipe],
                ["Statut", projet.statut],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="label !text-[0.6rem]">{k}</dt>
                <dd className="font-display italic leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          {projet.lien && (
            <p className="mt-3 border-t border-accent/50 pt-3 text-sm">
              <span className="label !text-[0.6rem]">Lien</span>
              <br />
              {projet.lien}
            </p>
          )}
        </aside>
      </div>

      {lien && (
        <p className="mt-5">
          <Link href={`/reportages/${projet.slug}`} className="label inline-block border border-accent px-4 py-3 transition-colors hover:bg-accent hover:text-bg">
            Lire le reportage →
          </Link>
        </p>
      )}
    </article>
  );
}
