import { identite } from "@/content/identite";
import { pad, pageLabel, rubriques } from "@/content/sections";
import { PiedDePage } from "../ui/PiedDePage";

/** p. 02 — Sommaire (l'effet « machine à écrire » arrive en phase 5). */
export function Sommaire() {
  return (
    <section id="sommaire" aria-labelledby="sommaire-titre" className="relative z-10 -mt-[100svh] min-h-svh bg-bg pb-16 pl-4 pr-10 pt-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="label">{identite.magazine} · {identite.numero}</p>
        <h2 id="sommaire-titre" className="mt-3 font-display text-6xl italic leading-none text-accent sm:text-7xl">
          Sommaire
        </h2>
        <hr className="filet mt-6" />
        <ol className="mt-4">
          {rubriques
            .filter((r) => r.id !== "sommaire")
            .map((r) => (
              <li key={r.id}>
                <a href={`#${r.id}`} className="group flex items-baseline gap-3 py-3">
                  <span className="font-display text-2xl italic transition-colors group-hover:text-accent sm:text-3xl">{r.titre}</span>
                  <span className="min-w-6 flex-1 translate-y-[-0.3em] border-b border-dotted border-accent/70" aria-hidden="true" />
                  <span className="label tabular-nums">p. {pageLabel(r).split("-").map((n) => pad(Number(n))).join("-")}</span>
                </a>
                <p className="pb-2 text-soft">{r.accroche}</p>
              </li>
            ))}
        </ol>
        <PiedDePage page={2} />
      </div>
    </section>
  );
}
