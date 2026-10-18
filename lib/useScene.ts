"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefs } from "@/components/PrefsProvider";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Les sections épinglées se rafraîchissent dans l'ordre de la page (priorité décroissante),
 * même si l'une d'elles est recréée plus tard.
 */
export const PRIO = {
  scene: 100,
  parcours: 90,
  experience: 80,
  reportages: 70,
  atouts: 50,
  fin: 20,
} as const;

/**
 * Monte les animations d'une rubrique avec un contexte GSAP (nettoyé au démontage).
 * Avec « mouvement réduit », rien n'est animé : le contenu reste lisible tel quel.
 */
export function useScene(ref: RefObject<HTMLElement | null>, setup: (root: HTMLElement) => void, deps: unknown[] = []) {
  const { ready, reducedMotion } = usePrefs();

  useEffect(() => {
    const root = ref.current;
    if (!ready || reducedMotion || !root) return;
    const ctx = gsap.context(() => setup(root), root);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reducedMotion, ...deps]);
}

/** Découpe un texte en mots (pour les révélations mot par mot). */
export const mots = (t: string) => t.split(/\s+/).filter(Boolean);
