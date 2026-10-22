"use client";

import { useEffect, useRef, useState } from "react";
import { identite } from "@/content/identite";
import { pad, pageLabel, rubriques } from "@/content/sections";
import { PiedDePage } from "../ui/PiedDePage";
import { allerA } from "../SmoothScroll";
import FlowingMenu from "../reactbits/FlowingMenu";
import { play } from "@/lib/sound";

/**
 * p. 02 — Sommaire
 * Effet : React Bits « Flowing Menu ». Les lignes se posent une à une quand le sommaire arrive à l'écran ; au survol,
 * une bande dorée suit le curseur et fait défiler l'accroche de la rubrique. Un clic mène à la page.
 */
const lignes = rubriques.filter((r) => r.id !== "sommaire");
const items = lignes.map((r) => ({
  text: r.titre,
  link: `#${r.id}`,
  marquee: r.accroche,
  meta: `p. ${pageLabel(r).split("-").map((n) => pad(Number(n))).join("-")}`,
}));

export function Sommaire() {
  const zone = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [haut, setHaut] = useState(76);

  useEffect(() => {
    const el = zone.current;
    if (!el) return;
    const taille = () => setHaut(window.innerWidth < 640 ? 66 : 88);
    taille();
    window.addEventListener("resize", taille);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          play("machine");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => {
      window.removeEventListener("resize", taille);
      io.disconnect();
    };
  }, []);

  return (
    <section id="sommaire" aria-labelledby="sommaire-titre" className="relative z-10 -mt-[100svh] min-h-svh overflow-hidden pb-16 pl-4 pr-10 pt-24 sm:px-8">
      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="label flex justify-between !text-fg">
          <span>
            {identite.magazine} · {identite.numero}
          </span>
          <span className="tabular-nums">p. 02</span>
        </p>
        <h2 id="sommaire-titre" className="titre-xl mt-3 text-[clamp(4.2rem,19vw,9.5rem)] text-fg">
          Sommaire
        </h2>
        <hr className="filet mt-6" />
        <div ref={zone} className="mt-2" style={{ height: lignes.length * haut }}>
          {visible && (
            <FlowingMenu
              items={items}
              ariaLabel="Sommaire du magazine"
              align="left"
              showIndex
              dividers
              speed={70}
              direction="alternate"
              textColor="#121212"
              bgColor="transparent"
              marqueeBgColor="#f2b400"
              marqueeTextColor="#121212"
              borderColor="rgba(18,18,18,0.16)"
              onItemClick={(item, i, e) => {
                e.preventDefault();
                play("page");
                allerA(lignes[i].id);
              }}
              className="font-display italic"
            />
          )}
        </div>
        <PiedDePage page={2} />
      </div>
    </section>
  );
}
