"use client";

import { useRef } from "react";
import { competences } from "@/content/competences";
import { Page } from "./Page";
import { gsap, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 16 — Compétences · motif : le tennis
 * Effet : une balle de tennis rebondit de catégorie en catégorie au scroll ; chaque rebond allume un bloc.
 * Le fond évoque un court vu de haut (lignes blanches fines sur terre battue très désaturée).
 * Son : le « pop » d'une raquette à chaque rebond.
 */
function Court() {
  const ref = useRef<HTMLDivElement>(null);

  useScene(ref, (root) => {
    const blocs = gsap.utils.toArray<HTMLElement>("[data-bloc]", root);
    const balle = root.querySelector("[data-balle]") as HTMLElement;
    const ombre = root.querySelector("[data-ombre]") as HTMLElement;
    const N = blocs.length;
    gsap.set(blocs, { opacity: 0.32 });
    let dernier = -1;

    const point = (k: number) => {
      const b = blocs[Math.max(0, Math.min(N - 1, k))];
      const droite = b.dataset.cote === "d";
      return { x: b.offsetLeft + (droite ? b.offsetWidth * 0.78 : b.offsetWidth * 0.22), y: b.offsetTop + 8 };
    };

    const maj = (p: number) => {
      const seg = Math.min(N - 1, Math.floor(p));
      const u = Math.min(1, p - seg);
      // segment 0 : le service, la balle arrive d'en haut sur le premier bloc ; ensuite de bloc en bloc
      const depart = seg === 0 ? { x: point(0).x, y: point(0).y - 220 } : point(seg - 1);
      const cible = point(seg);
      const haut = Math.min(160, Math.abs(cible.y - depart.y) * 0.45 + 40);
      const x = depart.x + (cible.x - depart.x) * u;
      const yDroit = depart.y + (cible.y - depart.y) * u;
      const y = seg === 0 ? yDroit : yDroit - 4 * haut * u * (1 - u);
      const proche = 1 - Math.abs(2 * u - 1);
      gsap.set(balle, { x: x - 14, y: y - 14, scaleY: 1 - 0.28 * Math.pow(proche, 8), rotation: p * 260 });
      gsap.set(ombre, { x: x - 14, y: yDroit + 18, opacity: 0.32 - 0.22 * Math.sin(Math.PI * u), scaleX: 1 - 0.4 * Math.sin(Math.PI * u) });
      // un bloc s'allume quand la balle le touche
      const idx = u > 0.97 ? seg : seg - 1;
      blocs.forEach((bl, i) => {
        const allume = i <= idx;
        if ((bl.dataset.on === "1") !== allume) {
          bl.dataset.on = allume ? "1" : "0";
          gsap.to(bl, { opacity: allume ? 1 : 0.32, duration: 0.35 });
        }
      });
      if (idx !== dernier) {
        if (idx > dernier && idx >= 0) play("pop");
        dernier = idx;
      }
    };

    const etat = { p: 0 };
    gsap.to(etat, {
      p: N,
      ease: "none",
      onUpdate: () => maj(etat.p),
      scrollTrigger: { trigger: root, start: "top 62%", end: "bottom 70%", scrub: 0.4, invalidateOnRefresh: true },
    });
    maj(0);
  });

  return (
    <div
      ref={ref}
      className="relative mt-10 overflow-hidden py-14"
      style={{
        background: "var(--court)",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.55),rgba(255,255,255,.55)),linear-gradient(rgba(255,255,255,.55),rgba(255,255,255,.55)),linear-gradient(rgba(255,255,255,.55),rgba(255,255,255,.55))",
        backgroundSize: "2px 100%, 2px 100%, 100% 2px",
        backgroundPosition: "6% 0, 94% 0, 0 50%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ul className="relative space-y-24 px-4 sm:px-8">
        {competences.map((c, i) => (
          <li
            key={c.categorie}
            data-bloc
            data-cote={i % 2 ? "d" : "g"}
            className={`relative w-[78%] bg-bg/80 px-4 py-5 backdrop-blur-[1px] sm:w-[58%] ${i % 2 ? "ml-auto" : ""}`}
          >
            <h3 className="font-display text-3xl italic leading-none">{c.categorie}</h3>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {c.items.map((it) => (
                <li key={it} className="label !text-fg">
                  {it}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <span data-ombre aria-hidden="true" className="pointer-events-none absolute left-0 top-0 block h-2 w-7 rounded-full bg-black" />
      <span data-balle aria-hidden="true" className="pointer-events-none absolute left-0 top-0 block h-7 w-7 will-change-transform">
        <svg viewBox="0 0 28 28" className="h-full w-full">
          <circle cx="14" cy="14" r="13" fill="#cdd65a" />
          <path d="M3 8c8 2 8 10 0 12M25 8c-8 2-8 10 0 12" fill="none" stroke="#f6f3e6" strokeWidth="1.6" />
        </svg>
      </span>
      <style>{`
        :root { --court: #d2b79c; }
        :root[data-theme="dark"] { --court: #3b3029; }
      `}</style>
    </div>
  );
}

export function Competences() {
  return (
    <Page id="competences">
      <Court />
    </Page>
  );
}
