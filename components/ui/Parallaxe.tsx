"use client";

import { useEffect } from "react";
import { usePrefs } from "../PrefsProvider";
import { gsap, ScrollTrigger } from "@/lib/useScene";

/**
 * Donne de la profondeur aux illustrations : celles qui portent data-vitesse glissent à leur propre rythme
 * pendant que leur section traverse l'écran. Monté une fois, après toutes les sections.
 */
export function Parallaxe() {
  const { ready, reducedMotion } = usePrefs();

  useEffect(() => {
    if (!ready || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-vitesse]").forEach((el) => {
        const v = parseFloat(el.dataset.vitesse ?? "0");
        if (!v) return;
        const hote = (el.closest("section") ?? el.parentElement) as HTMLElement;
        gsap.fromTo(
          el,
          { y: () => -v * 60 },
          { y: () => v * 60, ease: "none", scrollTrigger: { trigger: hote, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } },
        );
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [ready, reducedMotion]);

  return null;
}
