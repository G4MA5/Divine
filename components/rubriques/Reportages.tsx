"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { projets } from "@/content/projets";
import { Page } from "./Page";
import { CouvertureProjet } from "../reportages/CouvertureProjet";
import { DossierContenu } from "../reportages/DossierContenu";
import { usePrefs } from "../PrefsProvider";
import { gsap, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 08-15 — Reportages
 * Six couvertures de magazine ; un clic ouvre le dossier par un « iris » : un disque blanc grandit depuis la couverture
 * choisie jusqu'à remplir l'écran, puis le dossier se compose (couverture, titre, texte). Refermer fait l'inverse.
 * Son : une page qu'on tourne.
 */
type Origine = { x: number; y: number };

function Dossier({ index, origine, onClose }: { index: number; origine: Origine; onClose: () => void }) {
  const { reducedMotion } = usePrefs();
  const racine = useRef<HTMLDivElement>(null);
  const fermer = useRef<HTMLButtonElement>(null);
  const ferme = useRef(false);
  const p = projets[index];
  const rayon = () => Math.hypot(window.innerWidth, window.innerHeight) * 1.05;
  const iris = (r: number) => `circle(${r}px at ${origine.x}px ${origine.y}px)`;

  const fin = () => {
    if (ferme.current) return;
    ferme.current = true;
    if (reducedMotion || !racine.current) return onClose();
    play("fermer");
    gsap.to(racine.current, { clipPath: iris(0), duration: 0.75, ease: "power3.inOut", onComplete: onClose });
  };

  useEffect(() => {
    const el = racine.current;
    if (!el) return;
    fermer.current?.focus();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fin();
      if (e.key === "Tab") {
        const f = [...el.querySelectorAll<HTMLElement>("button, a[href]")];
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (f.length) {
          e.preventDefault();
          f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    if (!reducedMotion) {
      play("page");
      gsap.fromTo(el, { clipPath: iris(0) }, { clipPath: iris(rayon()), duration: 0.95, ease: "power3.inOut" });
      gsap.fromTo(el.querySelectorAll("[data-entre]"), { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.09, delay: 0.55, clearProps: "opacity,transform" });
      // le titre : ses mots montent depuis la ligne de base
      const t = el.querySelector("[data-titre-dossier]");
      if (t) {
        const mots = (t.textContent ?? "").split(" ");
        t.setAttribute("aria-label", t.textContent ?? "");
        t.innerHTML = mots.map((m) => `<span aria-hidden="true" style="display:inline-block;transform-origin:50% 100%" data-m>${m}</span>`).join(" ");
        gsap.fromTo(t.querySelectorAll("[data-m]"), { scaleY: 0, yPercent: 25 }, { scaleY: 1, yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.7, clearProps: "transform" });
      }
    }
    return () => {
      gsap.killTweensOf(el.querySelectorAll("[data-entre], [data-m]"));
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      lenis?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div ref={racine} data-lenis-prevent role="dialog" aria-modal="true" aria-label={`Dossier ${p.titre}`} className="fixed inset-0 z-[90] overflow-y-auto bg-white" style={reducedMotion ? undefined : { clipPath: iris(0) }}>
      <button ref={fermer} type="button" onClick={fin} aria-label="Refermer le dossier" className="btn fixed right-4 top-4 z-10 !px-4 !py-2">
        Refermer ×
      </button>
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-20 sm:px-8">
        <div data-entre>
          <DossierContenu projet={p} numero={index + 1} niveau={2} lien />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Grille() {
  const ref = useRef<HTMLDivElement>(null);
  const [ouvert, setOuvert] = useState<{ i: number; o: Origine } | null>(null);
  const declencheur = useRef<HTMLElement | null>(null);

  useScene(ref, (root) => {
    const cartes = gsap.utils.toArray<HTMLElement>("[data-mini]", root);
    gsap.set(cartes, { opacity: 0, y: 70, rotation: (i: number) => (i % 2 ? 3 : -3) });
    gsap.to(cartes, { opacity: 1, y: 0, rotation: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, scrollTrigger: { trigger: root, start: "top 80%", once: true } });
  });

  return (
    <div ref={ref} className="mt-12">
      <ul className="grid gap-x-6 gap-y-12 [grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))]">
        {projets.map((p, i) => (
          <li key={p.slug} data-mini>
            <button
              type="button"
              className="mini block w-full text-left"
              aria-label={`Ouvrir le dossier ${p.titre}`}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                declencheur.current = e.currentTarget;
                setOuvert({ i, o: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
              }}
            >
              <CouvertureProjet p={p} numero={i + 1} />
              <span className="mt-4 flex items-center justify-between gap-3">
                <span className="font-sans text-base">
                  N°{String(i + 1).padStart(2, "0")} — {p.titre}
                </span>
                <span aria-hidden="true" className="label !text-fg">
                  Lire →
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {ouvert && (
        <Dossier
          index={ouvert.i}
          origine={ouvert.o}
          onClose={() => {
            setOuvert(null);
            declencheur.current?.focus();
          }}
        />
      )}
    </div>
  );
}

export function Reportages() {
  return (
    <Page id="reportages" large>
      <p className="mt-6 max-w-2xl font-display text-2xl italic leading-snug sm:text-3xl">Six projets à la une. Choisis une couverture : elle s&apos;ouvre sur le dossier.</p>
      <Grille />
    </Page>
  );
}
