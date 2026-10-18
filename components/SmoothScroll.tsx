"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefs } from "./PrefsProvider";

gsap.registerPlugin(ScrollTrigger);

/** Scroll fluide (Lenis) branché sur GSAP. Désactivé si le visiteur demande moins de mouvement. */
export function SmoothScroll() {
  const { reducedMotion, ready } = usePrefs();

  useEffect(() => {
    if (!ready || reducedMotion) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [ready, reducedMotion]);

  return null;
}

/** Défile vers une rubrique (avec Lenis si présent, sinon natif). */
export function allerA(id: string, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) lenis.scrollTo(el, { immediate, offset: 0 });
  else el.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
}
