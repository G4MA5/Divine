"use client";

import { useEffect, useRef, useState } from "react";
import { pageLabel, pad, rubriques } from "@/content/sections";
import { allerA } from "../SmoothScroll";
import { play } from "@/lib/sound";

/** Icône livre : ouvre le sommaire à tout moment. */
export function BoutonSommaire() {
  const [ouvert, setOuvert] = useState(false);
  const fermer = useRef<HTMLButtonElement>(null);
  const declencheur = useRef<HTMLButtonElement>(null);
  const boite = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    fermer.current?.focus();
    // Échap ferme ; Tab reste dans la fenêtre
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
      if (e.key !== "Tab") return;
      const f = [...(boite.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? [])];
      if (!f.length) return;
      const premier = f[0];
      const dernier = f[f.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      declencheur.current?.focus();
    };
  }, [ouvert]);

  const aller = (id: string) => {
    setOuvert(false);
    play("page");
    // laisse le temps au scroll de se débloquer
    setTimeout(() => allerA(id), 60);
  };

  return (
    <>
      <button
        ref={declencheur}
        type="button"
        onClick={() => {
          play("papier");
          setOuvert(true);
        }}
        aria-label="Ouvrir le sommaire"
        aria-haspopup="dialog"
        title="Sommaire"
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-accent/60 bg-bg/85 text-accent backdrop-blur transition-colors hover:bg-bg-deep"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 6.2C10 4.8 7 4.4 3.5 5v13c3.5-.6 6.5-.2 8.5 1.2 2-1.4 5-1.8 8.5-1.2V5c-3.5-.6-6.5-.2-8.5 1.2Z" />
          <path d="M12 6.2v13" />
        </svg>
      </button>

      {ouvert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sommaire"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bg/96 px-4 py-16 backdrop-blur-sm"
        >
          <div ref={boite} className="w-full max-w-xl">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-4xl italic">Sommaire</h2>
              <button
                ref={fermer}
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer le sommaire"
                className="label border border-accent/60 px-3 py-2 transition-colors hover:bg-bg-deep"
              >
                Fermer
              </button>
            </div>
            <hr className="filet mt-4" />
            <ol className="mt-2">
              {rubriques.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => aller(r.id)}
                    className="group flex w-full items-baseline gap-3 py-3 text-left"
                  >
                    <span className="font-display text-xl italic transition-colors group-hover:text-accent">{r.titre}</span>
                    <span className="min-w-6 flex-1 translate-y-[-0.25em] border-b border-dotted border-accent/60" aria-hidden="true" />
                    <span className="label tabular-nums">p. {pageLabel({ ...r, page: r.page, fin: r.fin }).split("-").map((n) => pad(Number(n))).join("-")}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
