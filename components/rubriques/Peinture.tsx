"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useContenu } from "@/components/ContenuProvider";
import { Page } from "./Page";
import { Machine } from "../ui/Effets";
import BounceCards from "../reactbits/BounceCards";
import { play } from "@/lib/sound";

/**
 * p. 19-20 — Divine à la peinture : la galerie.
 * Effet : React Bits « Bounce Cards ». Les tableaux rebondissent en éventail à l'arrivée de la galerie ; au survol, le
 * tableau se redresse et les voisins s'écartent ; un clic l'ouvre en grand (flèches et Échap au clavier).
 * Son : un « tic » à l'arrivée, un froissement à l'ouverture.
 */

function Lightbox({ index, onClose, onNav }: { index: number; onClose: () => void; onNav: (d: number) => void }) {
  const { peinture } = useContenu();
  const tableaux = peinture.tableaux;
  const t = tableaux[index];
  const fermer = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fermer.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
      if (e.key === "Tab") {
        // le focus reste dans la visionneuse
        const f = [...document.querySelectorAll<HTMLElement>("[data-lightbox] button")];
        const i = f.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onNav]);

  return (
    <div data-lightbox role="dialog" aria-modal="true" aria-label={`Tableau n° ${index + 1}`} className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-white/97 px-4 py-14">
      <button ref={fermer} type="button" onClick={onClose} aria-label="Fermer" className="btn absolute right-4 top-4 !px-4 !py-2">
        Fermer
      </button>
      <div className="flex w-full max-w-4xl items-center gap-3">
        <button type="button" onClick={() => onNav(-1)} aria-label="Tableau précédent" className="btn !px-3 !py-3 text-lg">
          ←
        </button>
        <div className="flex-1">
          <div className="mx-auto border border-ink/80 bg-white p-5" style={{ maxWidth: `min(100%, ${Math.round(62 * Math.min(t.ratio, 1.25))}vh)` }}>
            <div className="relative w-full bg-[#f3f2ee]" style={{ aspectRatio: String(t.ratio) }}>
              {t.image ? (
                <Image src={t.image} alt={t.titre ?? `Tableau n° ${index + 1}`} fill sizes="90vw" className="object-contain" priority />
              ) : (
                <span aria-hidden="true" className="absolute inset-0" />
              )}
            </div>
          </div>
          {t.titre && <p className="mt-6 text-center font-display text-2xl font-bold italic">{t.titre}</p>}
          <p className="label mt-1 text-center">{[t.annee, t.technique, t.dimensions].filter(Boolean).join(" · ") || `N° ${String(index + 1).padStart(2, "0")} sur ${tableaux.length}`}</p>
        </div>
        <button type="button" onClick={() => onNav(1)} aria-label="Tableau suivant" className="btn !px-3 !py-3 text-lg">
          →
        </button>
      </div>
    </div>
  );
}

/** Cadre vide (en attendant les images) : un fond de toile doux avec un fin liseré. */
const TOILE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3f2ee"/><rect x="9" y="9" width="82" height="82" fill="none" stroke="#121212" stroke-opacity=".18" stroke-width=".8"/></svg>',
  );

function Galerie() {
  const { peinture } = useContenu();
  const tableaux = peinture.tableaux;
  const ref = useRef<HTMLDivElement>(null);
  const [ouvert, setOuvert] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [largeur, setLargeur] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mesurer = () => setLargeur(el.clientWidth);
    mesurer();
    const ro = new ResizeObserver(mesurer);
    ro.observe(el);
    // les cartes ne rebondissent qu'à l'arrivée de la galerie à l'écran
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          play("tic");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const n = tableaux.length;
  const petit = largeur > 0 && largeur < 640;
  const carte = petit ? Math.min(170, Math.round(largeur * 0.46)) : Math.min(230, Math.round(largeur / 4.2));
  const pas = n > 1 ? Math.min(carte * 0.78, (largeur - carte * 1.25) / (n - 1)) : 0;
  const images = tableaux.map((t, i) => ({ src: t.image ?? TOILE, alt: t.titre ?? `Tableau n° ${i + 1}` }));

  return (
    <div ref={ref} className="mt-14">
      <div className="flex justify-center" style={{ minHeight: carte * 1.5 }}>
        {visible && largeur > 0 && (
          <BounceCards
            key={`${carte}-${Math.round(pas)}`}
            images={images}
            containerWidth={largeur}
            containerHeight={Math.round(carte * 1.5)}
            cardSize={carte}
            spread={pas}
            rotation={petit ? 7 : 9}
            borderWidth={4}
            borderColor="#121212"
            radius={4}
            shadow={false}
            pushDistance={petit ? 24 : Math.round(carte * 0.7)}
            animationDelay={0.1}
            animationStagger={0.12}
            onCardClick={(i) => {
              play("papier");
              setOuvert(i);
            }}
          />
        )}
      </div>
      <p className="label mt-6 text-center">{petit ? "Touchez un tableau pour l'ouvrir" : "Survolez les tableaux, cliquez pour les ouvrir"}</p>
      {ouvert !== null && <Lightbox index={ouvert} onClose={() => setOuvert(null)} onNav={(d) => setOuvert((i) => ((i ?? 0) + d + tableaux.length) % tableaux.length)} />}
    </div>
  );
}

export function Peinture() {
  const { peinture: peintureIntro } = useContenu();
  return (
    <Page id="peinture" titre={peintureIntro.titre} large trait>
      <p className="mt-6 max-w-2xl font-display text-2xl italic leading-snug sm:text-3xl"><Machine texte={peintureIntro.chapo} vitesse={55} /></p>
      <Galerie />
    </Page>
  );
}
