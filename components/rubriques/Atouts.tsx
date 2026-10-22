"use client";

import { useContenu } from "@/components/ContenuProvider";

import { useRef } from "react";
import { Page } from "./Page";
import { gsap, useScene } from "@/lib/useScene";

/**
 * p. 17 — Atouts
 * Quatre bandes de texte géantes : chaque atout défile en boucle, une bande vers la gauche, la suivante vers la droite,
 * en alternant lettres pleines et lettres creuses. Le défilement réagit au scroll : plus on défile vite, plus les bandes
 * accélèrent (et changent de sens avec le scroll), puis reviennent à leur allure tranquille.
 */
const REPETITIONS = 6;

function Bande({ texte, i }: { texte: string; i: number }) {
  const creux = i % 2 === 1;
  const morceau = (k: number) => (
    <span key={k} className="flex shrink-0 items-center gap-[0.35em] pr-[0.35em]">
      <span className={creux ? "texte-creux" : ""}>{texte}</span>
      <span aria-hidden="true" className="inline-block h-[0.28em] w-[0.28em] rounded-full bg-gold" />
    </span>
  );
  return (
    <li
      data-bande
      data-sens={i % 2 === 0 ? -1 : 1}
      className="titre-xl overflow-hidden border-b border-ink/15 py-[0.12em] text-[clamp(2.6rem,9vw,6.5rem)] first:border-t"
    >
      <span className="sr-only">{texte}</span>
      <div aria-hidden="true" data-piste className="flex w-max whitespace-nowrap will-change-transform">
        {Array.from({ length: REPETITIONS }, (_, k) => morceau(k))}
      </div>
    </li>
  );
}

function Bandes() {
  const { atouts } = useContenu();
  const ref = useRef<HTMLUListElement>(null);

  useScene(ref, (root) => {
    const pistes = gsap.utils.toArray<HTMLElement>("[data-piste]", root);
    const etat = pistes.map((p, i) => ({ el: p, x: 0, sens: i % 2 === 0 ? -1 : 1, largeur: 0 }));
    const mesurer = () => etat.forEach((e) => (e.largeur = e.el.scrollWidth / REPETITIONS));
    mesurer();
    // les bandes qui vont vers la droite démarrent décalées d'un morceau pour ne jamais montrer de vide
    etat.forEach((e) => (e.x = e.sens === 1 ? -e.largeur : 0));
    let boost = 0;

    const tick = (_t: number, dt: number) => {
      const lenis = (window as unknown as { __lenis?: { velocity: number } }).__lenis;
      const v = lenis?.velocity ?? 0;
      boost += (Math.min(Math.abs(v), 40) * Math.sign(v) - boost) * 0.08;
      const pas = dt / 1000;
      etat.forEach((e, i) => {
        if (!e.largeur) return;
        const vitesse = 36 + i * 6; // px/s au repos
        e.x += e.sens * (vitesse * pas + Math.abs(boost) * 2.2 * pas * 60 * 0.12) * (boost < 0 ? -1 : 1);
        if (e.x <= -e.largeur) e.x += e.largeur;
        if (e.x > 0) e.x -= e.largeur;
        gsap.set(e.el, { x: e.x });
      });
    };
    gsap.ticker.add(tick);
    window.addEventListener("resize", mesurer);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", mesurer);
    };
  });

  return (
    <ul ref={ref} className="-mx-4 mt-10 sm:-mx-8" aria-label="Mes atouts">
      {atouts.map((a, i) => (
        <Bande key={a} texte={a} i={i} />
      ))}
    </ul>
  );
}

export function Atouts() {
  return (
    <Page id="atouts" large>
      <Bandes />
    </Page>
  );
}
