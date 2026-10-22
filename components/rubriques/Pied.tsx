"use client";

import { useState } from "react";
import { identite } from "@/content/identite";
import { TitreAnime } from "../ui/TitreAnime";
import { Tournesols } from "../ui/Tournesols";
import { allerEnHaut } from "./Quatrieme";
import { play } from "@/lib/sound";

/**
 * Le pied de page : un grand mot de la fin dont les mots montent depuis la ligne de base (l'effet de Spencer Gabor),
 * les contacts sur une grille aux filets fins, et le champ de tournesols (inspiré de danielsun.space).
 */
export function Pied() {
  const [copie, setCopie] = useState(false);

  const copier = async () => {
    play("clic");
    try {
      await navigator.clipboard.writeText(identite.email);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      window.location.href = `mailto:${identite.email}`;
    }
  };

  const liens = [
    { nom: "GitHub", href: identite.github },
    { nom: "Instagram", href: identite.instagram },
    { nom: "WhatsApp", href: identite.whatsapp },
  ];

  return (
    <footer aria-label="Pied de page" className="relative overflow-hidden bg-white pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <TitreAnime as="p" texte="Merci d'avoir tourné les pages." className="titre-xl text-[clamp(3rem,12vw,9rem)]" />
        <TitreAnime as="p" texte="À très bientôt." delai={0.4} className="titre-xl mt-2 text-[clamp(3rem,12vw,9rem)] text-gold" />

        {/* la grille aux filets fins */}
        <div className="mt-16 grid border-y border-ink/20 sm:grid-cols-2 sm:divide-x sm:divide-ink/20">
          <div className="p-6">
            <p className="font-display text-lg italic text-soft">Disponible pour de nouvelles missions</p>
            <button type="button" onClick={copier} className="mt-3 inline-flex items-center gap-3 rounded-full border border-ink/25 px-4 py-2.5 font-sans text-sm font-semibold transition-colors hover:bg-ink hover:text-white">
              {identite.email}
              <span className="label !text-inherit">{copie ? "Copié ✓" : "Copier"}</span>
            </button>
          </div>
          <div className="border-t border-ink/20 p-6 sm:border-t-0">
            <p className="font-display text-lg italic text-soft">Retrouvez-moi</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {liens.map((l) => (
                <li key={l.nom}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-ink/25 px-4 py-2.5 font-sans text-sm font-semibold transition-colors hover:bg-ink hover:text-white">
                    {l.nom} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <p className="label">
            © 2026 {identite.nom} · {identite.magazine}
          </p>
          <button type="button" onClick={allerEnHaut} className="btn !px-4 !py-2">
            ↑ Retour à la couverture
          </button>
        </div>
      </div>

      {/* le champ de tournesols */}
      <Tournesols />
    </footer>
  );
}
