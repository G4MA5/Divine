"use client";

import { useRef, type ElementType } from "react";
import { gsap, useScene } from "@/lib/useScene";

/**
 * Le titre dont les mots montent depuis la ligne de base, un par un (l'effet du portfolio de Spencer Gabor) :
 * chaque mot grandit de 0 à 100 % de sa hauteur, ancré en bas, avec un léger décalage entre les mots.
 * Le texte complet reste lisible par les lecteurs d'écran (aria-label).
 */
export function TitreAnime({
  texte,
  as: Tag = "h2",
  className = "",
  id,
  delai = 0,
  declencheur = "top 88%",
}: {
  texte: string;
  as?: ElementType;
  className?: string;
  id?: string;
  delai?: number;
  declencheur?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const mots = texte.split(" ");

  useScene(ref, (root) => {
    const ws = root.querySelectorAll("[data-mot]");
    gsap.set(ws, { scaleY: 0, yPercent: 25 });
    gsap.to(ws, {
      scaleY: 1,
      yPercent: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
      delay: delai,
      scrollTrigger: { trigger: root, start: declencheur, once: true },
    });
  });

  return (
    <Tag ref={ref} id={id} aria-label={texte} className={className}>
      {mots.map((m, i) => (
        <span key={i} aria-hidden="true">
          <span data-mot className="mot-monte">
            {m}
          </span>
          {i < mots.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
