"use client";

import { useContenu } from "@/components/ContenuProvider";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Couverture } from "./Couverture";
import { usePortraitDisponible, useCvDisponible } from "../PortraitContext";
import { rubriques, pad, pageLabel } from "@/content/sections";
import { usePrefs } from "../PrefsProvider";
import type { SourcePerso } from "../scene3d/Perso3D";
import type { IdPerso } from "../scene3d/Personnage";

const Livre3D = dynamic(() => import("../scene3d/Livre3D"), { ssr: false });

/** Si WebGL est indisponible, la version CSS du magazine reste affichée. */
class Secours extends Component<{ children: ReactNode }, { erreur: boolean }> {
  state = { erreur: false };
  static getDerivedStateFromError() {
    return { erreur: true };
  }
  render() {
    return this.state.erreur ? null : this.props.children;
  }
}

/**
 * Le magazine en 3D : page de droite + couverture qui pivote autour de la reliure (son dos est la page de gauche).
 * Les parties portent data-s pour que les scènes GSAP les pilotent. La taille vient de la variable CSS --mw
 * posée par la scène parente. `variant` choisit le contenu des pages intérieures :
 * « sommaire » à l'ouverture, « fin » quand l'avatar referme le magazine.
 */
export function MagazineObject({ variant = "sommaire" }: { variant?: "sommaire" | "fin" }) {
  const { identite, projets } = useContenu();
  const fin = variant === "fin";
  const racine = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<{ pos: HTMLElement; cover: HTMLElement; table: HTMLElement | null } | null>(null);
  const [pret3d, setPret3d] = useState(false);
  const [persoSrc, setPersoSrc] = useState<SourcePerso | null>(null);
  const { avatar } = usePrefs();
  const portraitOk = usePortraitDisponible();
  const cvDispo = useCvDisponible();

  useEffect(() => {
    const r = racine.current;
    if (!r) return;
    const scene = r.closest("section") ?? r.parentElement;
    const el = scene?.querySelector("[data-s=avatar]") as HTMLElement | null;
    const svg = el?.querySelector("svg");
    const part = (n: string) => svg?.querySelector(`[data-part=${n}]`) ?? null;
    const legL = part("legL"), legR = part("legR"), armL = part("armL"), armR = part("armR"), head = part("head");
    if (el && legL && legR && armL && armR && head) {
      setPersoSrc({ el, parts: { legL, legR, armL, armR, head }, ancre: fin ? "droite" : "gauche" });
    }
    setSrc({
      pos: r.querySelector("[data-s=mag-pos]") as HTMLElement,
      cover: r.querySelector("[data-s=cover-flip]") as HTMLElement,
      table: (scene?.querySelector("[data-s=table]") as HTMLElement | null) ?? null,
    });
  }, [fin, avatar]);

  // la table dessinée en CSS laisse la place à celle de la 3D
  useEffect(() => {
    if (pret3d && src?.table) src.table.style.visibility = "hidden";
    // l'avatar à plat reste dans le DOM (il pilote le corps 3D) mais devient invisible
    if (pret3d && persoSrc) persoSrc.el.style.visibility = "hidden";
  }, [pret3d, src, persoSrc]);

  return (
    <div ref={racine} className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1600px" }}>
      {/* le titre de la page : il reste pour les lecteurs d'écran même quand le magazine CSS est masqué */}
      {!fin && <h1 className="sr-only">{identite.magazine} — {identite.nom}, {identite.titre}</h1>}
      {src && (
        <Secours>
          <Livre3D variante={variant} src={src} onPret={() => setPret3d(true)} portrait={portraitOk ? identite.portrait : null} cvDispo={cvDispo} identite={identite} nbProjets={projets.length} perso={persoSrc ? { id: ((avatar ?? "curieuse") as IdPerso), src: persoSrc } : null} />
        </Secours>
      )}
      {/* le magazine CSS reste dans le DOM : il porte le texte (h1, lien du CV) et pilote la scène GSAP ; il devient invisible dès que la 3D est à l'écran */}
      <div
        data-s="mag-pos"
        className="relative will-change-transform"
        style={{ width: "var(--mw)", height: "calc(var(--mw) * 4 / 3)", transformStyle: "preserve-3d", opacity: pret3d ? 0 : 1, visibility: pret3d ? "hidden" : undefined }}
      >
        {/* page de droite */}
        <div className="absolute inset-0 bg-white text-[#121212]" style={{ containerType: "inline-size" }} aria-hidden="true">
          {fin ? (
            <div className="absolute inset-[7cqw] flex flex-col justify-center text-center">
              <p className="font-sans uppercase tracking-[0.26em] text-ink/60" style={{ fontSize: "2.2cqw" }}>
                À suivre
              </p>
              <p className="mt-[5cqw] font-display font-black italic leading-none text-accent" style={{ fontSize: "12cqw" }}>
                Prochain numéro
              </p>
              <hr className="mx-auto mt-[6cqw] w-[20cqw] border-0 border-t border-[#d99a00]" />
              <p className="mt-[4cqw] font-display italic text-ink/70" style={{ fontSize: "4.4cqw" }}>
                {identite.email}
              </p>
            </div>
          ) : (
            <>
              <div className="absolute inset-[7cqw]">
                <p className="font-sans uppercase tracking-[0.26em] text-ink/60" style={{ fontSize: "2.2cqw" }}>
                  Ce qu&apos;il y a dans ce numéro
                </p>
                <ol className="mt-[6cqw]">
                  {rubriques.slice(1, 8).map((r) => (
                    <li key={r.id} className="flex items-baseline gap-[2cqw] py-[1.5cqw] font-display italic" style={{ fontSize: "4.6cqw" }}>
                      <span>{r.titre}</span>
                      <span className="flex-1 border-b border-dotted border-[#d99a00]" />
                      <span className="font-sans not-italic tabular-nums text-ink/60" style={{ fontSize: "2.4cqw" }}>
                        {pageLabel(r)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="absolute bottom-[4cqw] right-[7cqw] font-sans uppercase tracking-[0.2em] text-ink/50" style={{ fontSize: "2cqw" }}>
                {identite.magazine} — p. 03
              </p>
            </>
          )}
        </div>

        {/* la couverture, qui pivote autour de la reliure */}
        <div data-s="cover-flip" className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <Couverture titre="p" />
          </div>
          {/* dos de la couverture = page de gauche */}
          <div
            className="absolute inset-0 bg-white text-[#121212]" 
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", containerType: "inline-size" }}
            aria-hidden="true"
          >
            <div className="absolute inset-[7cqw]">
              <p className="font-sans uppercase tracking-[0.26em] text-ink/60" style={{ fontSize: "2.2cqw" }}>
                {identite.magazine}
              </p>
              <p className="mt-[14cqw] font-display font-black italic leading-none text-accent" style={{ fontSize: fin ? "13cqw" : "16cqw" }}>
                {fin ? "Merci" : "Sommaire"}
              </p>
              <hr className="mt-[6cqw] border-0 border-t border-[#d99a00]" />
              <p className="mt-[4cqw] font-display italic text-ink/70" style={{ fontSize: "4cqw" }}>
                {fin ? "Merci de votre lecture. À très bientôt." : "Des reportages, une interview et quelques surprises."}
              </p>
            </div>
            <p className="absolute bottom-[4cqw] left-[7cqw] font-sans uppercase tracking-[0.2em] text-ink/50" style={{ fontSize: "2cqw" }}>
              p. {pad(fin ? 23 : 2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
