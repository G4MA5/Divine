"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefs } from "../PrefsProvider";
import { gsap, ScrollTrigger, useScene } from "@/lib/useScene";
import { rubriques } from "@/content/sections";
import { allerA } from "../SmoothScroll";
import { play } from "@/lib/sound";

/* ──────────────────────────────────────────────────────────────────────────────
   Les effets repérés dans les portfolios de l'équipe :
   - le mot-filigrane géant qui glisse derrière chaque rubrique (Dev Yao)
   - la barre de navigation flottante avec sa pastille qui glisse (Caleb, Uriel)
   - les boutons « magnétiques » qui suivent le curseur (Caleb)
   - le trait dessiné à la main sous un titre (Caleb)
   - la machine à écrire avec son curseur (Dev Yao)
   ────────────────────────────────────────────────────────────────────────────── */

/** Les mots-filigranes glissent doucement de côté pendant que leur rubrique traverse l'écran. */
export function Filigranes() {
  const { ready, reducedMotion } = usePrefs();
  useEffect(() => {
    if (!ready || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-filigrane]").forEach((el) => {
        const hote = (el.closest("section") ?? el.parentElement) as HTMLElement;
        gsap.fromTo(el, { xPercent: 4 }, { xPercent: -22, ease: "none", scrollTrigger: { trigger: hote, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [ready, reducedMotion]);
  return null;
}

/** Barre flottante : les rubriques, une pastille qui glisse sous celle où l'on se trouve. */
export function NavFlottante() {
  const { ready, reducedMotion } = usePrefs();
  const [visible, setVisible] = useState(false);
  const [actif, setActif] = useState<string | null>(null);
  const barre = useRef<HTMLElement>(null);
  const pastille = useRef<HTMLSpanElement>(null);
  const liens = rubriques.filter((r) => ["edito", "parcours", "experience", "reportages", "competences", "peinture", "interview", "quatrieme"].includes(r.id));
  const nom: Record<string, string> = { edito: "Édito", parcours: "Parcours", experience: "Expérience", reportages: "Projets", competences: "Outils", peinture: "Peinture", interview: "Interview", quatrieme: "Contact" };

  useEffect(() => {
    let raf = 0;
    const maj = () => {
      raf = 0;
      const s = document.getElementById("sommaire");
      setVisible(!!s && s.getBoundingClientRect().top < window.innerHeight * 0.4);
      const mid = window.innerHeight * 0.45;
      let id: string | null = null;
      for (const l of liens) {
        const el = document.getElementById(l.id);
        if (!el) continue;
        const b = el.getBoundingClientRect();
        if (b.top <= mid && b.bottom > mid) id = l.id;
      }
      setActif(id);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(maj);
    };
    maj();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    const b = barre.current;
    const p = pastille.current;
    if (!b || !p) return;
    const lien = actif ? (b.querySelector(`[data-lien="${actif}"]`) as HTMLElement | null) : null;
    if (!lien) {
      gsap.to(p, { opacity: 0, duration: 0.2 });
      return;
    }
    const cible = { x: lien.offsetLeft, width: lien.offsetWidth, opacity: 1 };
    if (reducedMotion) gsap.set(p, cible);
    else gsap.to(p, { ...cible, duration: 0.5, ease: "power3.out" });
  }, [actif, reducedMotion, visible]);

  return (
    <nav
      ref={barre}
      aria-label="Rubriques"
      className={`fixed left-1/2 top-4 z-40 hidden -translate-x-1/2 items-center rounded-full border border-ink/15 bg-white/90 p-1 backdrop-blur transition-all duration-500 md:flex ${visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-6 opacity-0"}`}
    >
      <span ref={pastille} aria-hidden="true" className="absolute left-0 top-1 h-[calc(100%-0.5rem)] rounded-full bg-ink opacity-0" style={{ width: 0 }} />
      {liens.map((l) => (
        <a
          key={l.id}
          href={`#${l.id}`}
          data-lien={l.id}
          aria-current={actif === l.id ? "true" : undefined}
          onClick={(e) => {
            e.preventDefault();
            play("page");
            allerA(l.id);
          }}
          className={`relative z-10 rounded-full px-3.5 py-2 font-sans text-[0.72rem] font-semibold tracking-wide transition-colors ${actif === l.id ? "text-white" : "text-ink hover:text-gold"}`}
        >
          {nom[l.id]}
        </a>
      ))}
    </nav>
  );
}

/** Les boutons (.btn) sont attirés par le curseur quand il s'approche, puis reviennent en place. */
export function Aimants() {
  const { reducedMotion } = usePrefs();
  useEffect(() => {
    if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
    let courant: HTMLElement | null = null;
    const rendre = (el: HTMLElement) => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const onMove = (e: PointerEvent) => {
      const b = (e.target as HTMLElement | null)?.closest?.(".btn") as HTMLElement | null;
      if (courant && courant !== b) {
        rendre(courant);
        courant = null;
      }
      if (!b) return;
      courant = b;
      const r = b.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(b, { x: dx * 0.28, y: dy * 0.34, duration: 0.3, ease: "power3.out" });
    };
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);
  return null;
}

/** Un trait tracé à la main sous un titre (se dessine quand il entre dans la vue). */
export function Gribouillis({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useScene(ref as unknown as React.RefObject<HTMLElement>, (root) => {
    const path = root.querySelector("path") as SVGPathElement;
    const l = path.getTotalLength();
    gsap.set(path, { strokeDasharray: l, strokeDashoffset: l });
    gsap.to(path, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", delay: 0.5, scrollTrigger: { trigger: root, start: "top 92%", once: true } });
  });
  return (
    <svg ref={ref} aria-hidden="true" viewBox="0 0 400 24" preserveAspectRatio="none" className={`pointer-events-none block h-4 w-[min(70%,26rem)] sm:h-5 ${className}`}>
      <path d="M4 14 C 60 4, 110 20, 170 11 S 280 3, 330 12 S 380 18, 396 8" fill="none" stroke="#d99a00" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Le texte se tape comme à la machine, avec son curseur qui clignote. */
export function Machine({ texte, className = "", vitesse = 42 }: { texte: string; className?: string; vitesse?: number }) {
  const { reducedMotion, ready } = usePrefs();
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ready) return;
    if (reducedMotion) {
      setN(texte.length);
      return;
    }
    let i = 0;
    let t = 0;
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || t) return;
      t = window.setInterval(() => {
        i++;
        setN(i);
        if (i >= texte.length) window.clearInterval(t);
      }, vitesse);
    });
    if (el) io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(t);
    };
  }, [texte, vitesse, ready, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{texte}</span>
      <span aria-hidden="true">
        {texte.slice(0, n)}
        <span className="ml-0.5 inline-block w-[0.08em] animate-pulse bg-current align-[-0.1em]" style={{ height: "1em" }} />
      </span>
    </span>
  );
}
