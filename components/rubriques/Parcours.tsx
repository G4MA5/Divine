"use client";

import { useRef } from "react";
import { parcours } from "@/content/parcours";
import { identite } from "@/content/identite";
import { Page } from "./Page";
import { TitreAnime } from "../ui/TitreAnime";
import { gsap, ScrollTrigger, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 04-05 — Parcours, raconté comme un `git log --graph`
 * Chaque étape est un commit (son identifiant, sa date, son message). Le certificat du Michigan est une branche
 * qui part de la licence et y revient ; « HEAD » pointe sur l'étape en cours. Le graphe se trace au scroll et chaque
 * commit apparaît quand le fil l'atteint.
 */

const H = 168; // hauteur d'une ligne, en px
const A = 18; // abscisse de la branche principale
const B = 52; // abscisse de la branche du certificat

/** Un identifiant de commit stable (7 caractères hexadécimaux) calculé à partir du titre. */
const hash = (t: string) => {
  let h = 2166136261;
  for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};

// du plus récent (en haut, HEAD) au plus ancien : Master, Licence, Certificat (branche), Bac
const commits = [...parcours].sort((a, b) => ordre(b.periode) - ordre(a.periode));
function ordre(p: string) {
  if (/depuis 2026/i.test(p)) return 4;
  if (/2023-2026/.test(p)) return 3;
  if (/avril 2024/i.test(p)) return 2.5;
  return 1;
}

function Graphe({ branches }: { branches: boolean[] }) {
  const n = branches.length;
  const y = (i: number) => i * H + H / 2;
  const iB = branches.findIndex(Boolean);
  // la branche part de la licence (ligne juste au-dessus) et y revient (ligne juste en dessous)
  const haut = y(iB - 1);
  const bas = y(iB + 1);
  const dB = `M${A} ${haut} C ${A} ${haut + 40}, ${B} ${haut + 24}, ${B} ${y(iB) - 28} L ${B} ${y(iB) + 28} C ${B} ${bas - 24}, ${A} ${bas - 40}, ${A} ${bas}`;
  return (
    <svg aria-hidden="true" width="72" height={n * H} viewBox={`0 0 72 ${n * H}`} className="absolute left-0 top-0">
      <path d={`M${A} ${y(0)} V ${y(n - 1)}`} fill="none" stroke="#e3e1db" strokeWidth="2" />
      <path d={dB} fill="none" stroke="#e3e1db" strokeWidth="2" />
      <path data-fil d={`M${A} ${y(0)} V ${y(n - 1)}`} fill="none" stroke="#d99a00" strokeWidth="2.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      <path data-fil d={dB} fill="none" stroke="#121212" strokeWidth="2.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      {branches.map((b, i) => (
        <circle key={i} data-noeud cx={b ? B : A} cy={y(i)} r="8" fill="#fff" stroke={i === 0 ? "#d99a00" : "#121212"} strokeWidth="2.5" />
      ))}
    </svg>
  );
}

function Journal() {
  const ref = useRef<HTMLDivElement>(null);
  const branches = commits.map((c) => /avril 2024/i.test(c.periode));

  useScene(ref, (root) => {
    // les fils se dessinent au rythme du scroll
    gsap.to(root.querySelectorAll("[data-fil]"), { strokeDashoffset: 0, ease: "none", stagger: 0.05, scrollTrigger: { trigger: root, start: "top 65%", end: "bottom 65%", scrub: true } });

    gsap.utils.toArray<HTMLElement>("[data-commit]", root).forEach((r, i) => {
      const noeud = root.querySelectorAll("[data-noeud]")[i];
      gsap.set(noeud, { scale: 0, transformOrigin: "center", transformBox: "fill-box" });
      gsap.set(r.querySelectorAll("[data-ligne]"), { opacity: 0, y: 18 });
      ScrollTrigger.create({
        trigger: r,
        start: "top 70%",
        once: true,
        onEnter: () => {
          play("tic");
          gsap.to(noeud, { scale: 1, duration: 0.5, ease: "back.out(3)" });
          gsap.to(r.querySelectorAll("[data-ligne]"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 });
        },
      });
    });
  });

  return (
    <div ref={ref} className="relative mt-14 font-mono text-[0.92rem]">
      <p className="mb-6 text-soft">
        <span className="text-gold">$</span> git log --graph --oneline --decorate
      </p>
      <div className="relative">
        <Graphe branches={branches} />
        <ol>
          {commits.map((c, i) => (
            <li key={c.titre} data-commit className="flex flex-col justify-center border-b border-ink/10 pl-[5rem]" style={{ minHeight: H }}>
              <p data-ligne className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-gold">{hash(c.titre)}</span>
                {i === 0 && <span className="rounded-full bg-ink px-2.5 py-0.5 text-[0.7rem] font-semibold text-white">HEAD → master</span>}
                {branches[i] && <span className="rounded-full border border-ink px-2.5 py-0.5 text-[0.7rem] font-semibold">branche : certificat</span>}
              </p>
              <TitreAnime as="h3" texte={c.titre} className="titre-xl my-1 font-display text-[clamp(1.5rem,3.6vw,2.6rem)] !leading-[1.05]" declencheur="top 75%" />
              <p data-ligne className="text-soft">
                Date : {c.periode}
              </p>
              <p data-ligne className="font-display text-lg italic text-ink">
                {c.lieu}
                {c.detail && <span className="text-soft"> — {c.detail}</span>}
              </p>
            </li>
          ))}
          <li data-ligne className="pl-[5rem] pt-5 text-soft">
            Author : {identite.prenom} {identite.nom.split(" ")[0].charAt(0) + identite.nom.split(" ")[0].slice(1).toLowerCase()}
          </li>
        </ol>
      </div>
    </div>
  );
}

export function Parcours() {
  return (
    <Page id="parcours" large>
      <Journal />
    </Page>
  );
}
