"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefs } from "./PrefsProvider";
import { rubriques } from "@/content/sections";

gsap.registerPlugin(ScrollTrigger);

/** Scroll fluide (Lenis) branché sur GSAP. Désactivé si le visiteur demande moins de mouvement. */
export function SmoothScroll() {
  const { reducedMotion, ready } = usePrefs();

  useEffect(() => {
    if (!ready || reducedMotion) return;
    // défilement lissé à durée fixe : il garde le même rythme même si la machine tombe à quelques images par seconde
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // la hauteur de la page change (conversation du contact, polices, images) : on recalcule les scènes épinglées
    let minuteur: ReturnType<typeof setTimeout>;
    let hauteur = document.documentElement.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - hauteur) < 4) return;
      hauteur = h;
      clearTimeout(minuteur);
      minuteur = setTimeout(() => {
        ScrollTrigger.refresh();
        lenis.resize();
      }, 250);
    });
    ro.observe(document.body);

    // garde-fou : si le défilement est resté bloqué sans raison (aucune fenêtre ouverte), on le relance à la prochaine molette
    const secours = () => {
      if (lenis.isStopped && !document.querySelector("[role=dialog][aria-modal=true], .staggered-menu-wrapper[data-open], [class*='z-[96]']")) lenis.start();
    };
    window.addEventListener("wheel", secours, { passive: true });
    window.addEventListener("touchstart", secours, { passive: true });
    return () => {
      ro.disconnect();
      clearTimeout(minuteur);
      window.removeEventListener("wheel", secours);
      window.removeEventListener("touchstart", secours);
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [ready, reducedMotion]);

  return null;
}

type LenisLike = { scrollTo: (cible: number | HTMLElement, o?: object) => void; stop: () => void; start: () => void };
const lenisActif = () => (window as unknown as { __lenis?: LenisLike }).__lenis;
let enTransition = false;

/**
 * Les longs sauts (sommaire, bouton « retour à la couverture ») ne traversent pas toutes les scènes épinglées en
 * une seconde : un rideau sombre « tourne la page », on saute pendant qu'il couvre l'écran, puis il se lève.
 */
function rideau(label: string, saut: () => void) {
  enTransition = true;
  const lenis = lenisActif();
  lenis?.stop();
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.className = "pointer-events-auto fixed inset-0 z-[96] flex flex-col items-center justify-center bg-[#121212] text-[#f4f1ea]";
  el.innerHTML = `<p style="font:700 italic clamp(2.4rem,9vw,6rem)/1.05 var(--font-playfair),serif">${label}</p><span style="margin-top:1.1rem;width:min(12rem,40vw);height:2px;background:#f2b400;display:block;transform:scaleX(0);transform-origin:left"></span>`;
  document.body.appendChild(el);
  const trait = el.querySelector("span") as HTMLElement;
  gsap.set(el, { yPercent: 100, borderTopLeftRadius: "50% 8vh", borderTopRightRadius: "50% 8vh" });
  const fin = () => {
    el.remove();
    lenisActif()?.start();
    enTransition = false;
    ScrollTrigger.update();
  };
  gsap
    .timeline({ onComplete: fin })
    .to(el, { yPercent: 0, duration: 0.55, ease: "power3.inOut" })
    .add(saut)
    .to(trait, { scaleX: 1, duration: 0.45, ease: "power2.out" }, "<0.05")
    .to(el, { yPercent: -108, duration: 0.65, ease: "power3.inOut" }, "+=0.35");
}

/** Défile vers une position (en px) : en douceur si c'est proche, avec le rideau si c'est loin. */
export function allerAuY(y: number, label = "", immediate = false) {
  const lenis = lenisActif();
  const loin = Math.abs(y - window.scrollY) > window.innerHeight * 1.6;
  if (!lenis) {
    window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
    return;
  }
  if (immediate) return lenis.scrollTo(y, { immediate: true });
  if (enTransition) return;
  if (loin) rideau(label, () => lenis.scrollTo(y, { immediate: true, force: true }));
  else lenis.scrollTo(y, { duration: 1.3 });
}

/** Défile vers une rubrique (avec Lenis si présent, sinon natif). */
export function allerA(id: string, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = lenisActif();
  if (!lenis) {
    el.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
    return;
  }
  const r = rubriques.find((x) => x.id === id);
  const y = el.getBoundingClientRect().top + window.scrollY;
  allerAuY(y, r ? r.titre : "", immediate);
}
