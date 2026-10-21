"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { peintureIntro, tableaux, type Tableau } from "@/content/peinture";
import { Page } from "./Page";
import { Machine } from "../ui/Effets";
import { gsap, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 19-20 — Divine à la peinture : la galerie.
 * Effet : l'accrochage. Chaque tableau descend du plafond au bout de son fil, se balance comme un pendule puis se pose
 * dans son cadre ; au survol il se soulève et son cartel apparaît ; un clic l'ouvre en grand (flèches et Échap au clavier).
 * Son : un « tic » à chaque tableau accroché.
 */

function Cadre({ t, onOuvrir, indice }: { t: Tableau; onOuvrir: () => void; indice: number }) {
  return (
    <figure data-tableau className="group mb-10 inline-block w-full break-inside-avoid sm:mb-14">
      <button
        type="button"
        onClick={onOuvrir}
        aria-label={t.titre ? `Voir « ${t.titre} » en grand` : `Voir le tableau n° ${indice + 1} en grand`}
        className="relative block w-full origin-top text-left transition-transform duration-500 group-hover:-translate-y-1"
      >
        {/* le fil */}
        <span aria-hidden="true" data-fil className="absolute -top-10 left-1/2 h-10 w-px bg-ink/40" />
        {/* le cadre */}
        <span className="block border border-ink/80 bg-white p-3 duration-500 sm:p-5">
          <span className="relative block w-full overflow-hidden bg-[#f3f2ee]" style={{ aspectRatio: String(t.ratio) }}>
            {t.image ? (
              <Image src={t.image} alt={t.titre ?? `Tableau n° ${indice + 1}`} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw" className="object-cover" />
            ) : (
                <span aria-hidden="true" className="absolute inset-0" />
              )}
          </span>
        </span>
      </button>
      {/* le cartel, comme au musée */}
      <figcaption className="mt-4 translate-y-1 opacity-70 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        {t.titre && <p className="font-display text-lg font-bold italic leading-tight">{t.titre}</p>}
        <p className="label mt-1">{[t.annee, t.technique, t.dimensions].filter(Boolean).join(" · ") || `N° ${String(indice + 1).padStart(2, "0")}`}</p>
      </figcaption>
    </figure>
  );
}

function Lightbox({ index, onClose, onNav }: { index: number; onClose: () => void; onNav: (d: number) => void }) {
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

function Galerie() {
  const ref = useRef<HTMLDivElement>(null);
  const [ouvert, setOuvert] = useState<number | null>(null);

  useScene(ref, (root) => {
    const cadres = gsap.utils.toArray<HTMLElement>("[data-tableau]", root);
    cadres.forEach((c, i) => {
      const bouton = c.querySelector("button") as HTMLElement;
      gsap.set(bouton, { yPercent: -45, opacity: 0, rotation: i % 2 ? 7 : -7 });
      gsap.to(bouton, {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: c, start: "top 92%", once: true, onEnter: () => play("tic") },
      });
      // le pendule : il se balance puis se stabilise
      gsap.to(bouton, {
        rotation: 0,
        duration: 2.6,
        ease: "elastic.out(1, 0.28)",
        scrollTrigger: { trigger: c, start: "top 92%", once: true },
      });
    });
  });

  return (
    <div ref={ref} className="mt-14">
      <div className="columns-1 gap-10 sm:columns-2 lg:columns-3">
        {tableaux.map((t, i) => (
          <Cadre
            key={t.id}
            t={t}
            indice={i}
            onOuvrir={() => {
              play("papier");
              setOuvert(i);
            }}
          />
        ))}
      </div>
      {ouvert !== null && <Lightbox index={ouvert} onClose={() => setOuvert(null)} onNav={(d) => setOuvert((i) => ((i ?? 0) + d + tableaux.length) % tableaux.length)} />}
    </div>
  );
}

export function Peinture() {
  return (
    <Page id="peinture" titre={peintureIntro.titre} large trait>
      <p className="mt-6 max-w-2xl font-display text-2xl italic leading-snug sm:text-3xl"><Machine texte={peintureIntro.chapo} vitesse={55} /></p>
      <Galerie />
    </Page>
  );
}
