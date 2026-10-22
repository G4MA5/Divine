"use client";

import { useRef } from "react";
import { parcours } from "@/content/parcours";
import { identite } from "@/content/identite";
import { TitreAnime } from "../ui/TitreAnime";
import { PiedDePage } from "../ui/PiedDePage";
import { gsap, PRIO, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 04-05 — Parcours : le voyage dans l'historique git.
 * La scène s'épingle et le scroll fait avancer le curseur HEAD le long du graphe : à chaque étape la date défile comme
 * un compteur, la commande se tape dans le terminal, puis l'étape apparaît. Le certificat du Michigan est une branche
 * qui part de la licence et revient avant le master. Sans animation (mouvement réduit), c'est la liste complète.
 */

// ordre chronologique : bac, licence, certificat (branche), master
const ORDRE = (p: string) => (/depuis 2026/i.test(p) ? 4 : /avril 2024/i.test(p) ? 2.5 : /2023-2026/.test(p) ? 2 : 1);
const etapes = [...parcours].sort((a, b) => ORDRE(a.periode) - ORDRE(b.periode));
const estBranche = (p: string) => /avril 2024/i.test(p);

/** Identifiant de commit stable (7 caractères hexadécimaux) calculé à partir du titre. */
const hash = (t: string) => {
  let h = 2166136261;
  for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};

/** L'année affichée par le compteur pour chaque étape. */
const annee = (p: string) => (/depuis (\d{4})/i.exec(p)?.[1] ?? /(\d{4})/.exec(p)?.[0] ?? "");

const commande = (i: number, titre: string) => {
  if (i === etapes.length - 1) return "git switch master";
  if (estBranche(etapes[i].periode)) return "git switch -c certificat";
  return `git checkout ${hash(titre)}`;
};

// coordonnées du graphe (viewBox 72 × 400)
const A = 18;
const B = 52;
const Y = [40, 140, 250, 360];
const POINTS = etapes.map((e, i) => ({ x: estBranche(e.periode) ? B : A, y: Y[i] ?? 360 }));
const iB = etapes.findIndex((e) => estBranche(e.periode));
const principal = `M${A} ${Y[0]} V ${Y[Y.length - 1]}`;
const branche = iB > 0 ? `M${A} ${Y[iB - 1]} C ${A} ${Y[iB - 1] + 50}, ${B} ${Y[iB] - 55}, ${B} ${Y[iB]} C ${B} ${Y[iB] + 55}, ${A} ${Y[iB + 1] - 50}, ${A} ${Y[iB + 1]}` : "";

function Voyage() {
  const ref = useRef<HTMLDivElement>(null);

  useScene(ref, (root) => {
    const section = root.closest("section") as HTMLElement;
    root.classList.add("vy-actif");
    section.style.minHeight = "100svh";
    const panneaux = gsap.utils.toArray<HTMLElement>("[data-vy-panneau]", root);
    const noeuds = gsap.utils.toArray<SVGElement>("[data-vy-noeud]", root);
    const tete = root.querySelector("[data-vy-tete]") as SVGGElement;
    const cmd = root.querySelector("[data-vy-cmd]") as HTMLElement;
    const annees = root.querySelector("[data-vy-annees]") as HTMLElement;
    const fils = gsap.utils.toArray<SVGPathElement>("[data-vy-fil]", root);
    const n = panneaux.length;

    gsap.set(panneaux, { opacity: 0 });
    gsap.set(noeuds, { scale: 0, transformOrigin: "center", transformBox: "fill-box" });
    gsap.set(fils, { strokeDashoffset: 1 });
    gsap.set(tete, { x: POINTS[0].x, y: POINTS[0].y });
    cmd.textContent = "";

    const SEG = 1;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section, start: "top top", end: `+=${n * 95}%`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: PRIO.parcours },
    });
    const frappe = { n: 0 };
    panneaux.forEach((p, k) => {
      const t = k * SEG;
      const texte = commande(k, etapes[k].titre);
      // la tête de lecture avance (par la courbe de la branche si besoin) et allume l'étape
      tl.to(tete, { x: POINTS[k].x, y: POINTS[k].y, duration: k ? 0.45 : 0.01, ease: "power2.inOut" }, t)
        .to(noeuds[k], { scale: 1, duration: 0.2, ease: "back.out(3)" }, t + (k ? 0.3 : 0))
        .to(annees, { yPercent: -(100 / n) * k, duration: 0.4, ease: "power3.inOut" }, t)
        .call(() => play("tic"), [], t + 0.05)
        // la commande se tape
        .fromTo(
          frappe,
          { n: 0 },
          { n: texte.length, duration: 0.38, immediateRender: false, onUpdate: () => (cmd.textContent = texte.slice(0, Math.round(frappe.n))) },
          t + 0.08,
        )
        // l'étape apparaît, puis laisse la place à la suivante
        .fromTo(p, { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.3, ease: "power3.out", immediateRender: false }, t + 0.35);
      if (k < n - 1) tl.to(p, { opacity: 0, yPercent: -10, duration: 0.2, ease: "power2.in" }, t + 0.82);
    });
    // les fils se dessinent avec le voyage
    tl.to(fils[0], { strokeDashoffset: 0, duration: n * SEG - 0.5 }, 0.1);
    if (fils[1]) tl.to(fils[1], { strokeDashoffset: 0, duration: (n - 1 - iB) * SEG + 0.2 }, iB * SEG - 0.4 + 0.3);
    tl.to({}, { duration: 0.45 }); // un temps d'arrêt sur la dernière étape
    return () => {
      root.classList.remove("vy-actif");
      section.style.minHeight = "";
    };
  });

  return (
    <div ref={ref} className="vy mt-5">
      {/* le terminal */}
      <p aria-hidden="true" className="vy-anim mb-3 font-mono text-[0.85rem] text-soft">
        <span className="text-gold">$</span> <span data-vy-cmd />
        <span className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.15em] animate-pulse bg-ink" />
      </p>
      <div className="vy-grille items-start gap-x-4 sm:gap-x-8">
        <svg aria-hidden="true" viewBox="0 0 72 400" className="vy-anim h-[min(46svh,24rem)] w-auto justify-self-start overflow-visible">
          <path d={principal} fill="none" stroke="#e3e1db" strokeWidth="2" />
          {branche && <path d={branche} fill="none" stroke="#e3e1db" strokeWidth="2" />}
          <path data-vy-fil d={principal} fill="none" stroke="#d99a00" strokeWidth="2.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
          {branche && <path data-vy-fil d={branche} fill="none" stroke="#121212" strokeWidth="2.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />}
          {POINTS.map((p, i) => (
            <circle key={i} data-vy-noeud cx={p.x} cy={p.y} r="8" fill="#fff" stroke="#121212" strokeWidth="2.5" />
          ))}
          <g data-vy-tete>
            <circle r="13" fill="none" stroke="#d99a00" strokeWidth="2" opacity=".5" />
            <circle r="5.5" fill="#d99a00" />
            <text x="22" y="4" fontSize="11" fontFamily="monospace" fontWeight="700" fill="#121212">
              HEAD
            </text>
          </g>
        </svg>

        <ol className="vy-panneaux">
          {etapes.map((e, i) => (
            <li key={e.titre} data-vy-panneau className="vy-panneau border-b border-ink/10 pb-6 font-mono text-[0.92rem]">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-gold">{hash(e.titre)}</span>
                {i === etapes.length - 1 && <span className="rounded-full bg-ink px-2.5 py-0.5 text-[0.7rem] font-semibold text-white">HEAD → master</span>}
                {estBranche(e.periode) && <span className="rounded-full border border-ink px-2.5 py-0.5 text-[0.7rem] font-semibold">branche : certificat</span>}
              </p>
              <h3 className="titre-xl my-1.5 font-display text-[clamp(1.6rem,3.8vw,3rem)] !leading-[1.05]">{e.titre}</h3>
              <p className="text-soft">Date : {e.periode}</p>
              <p className="font-display text-lg italic text-ink">
                {e.lieu}
                {e.detail && <span className="text-soft"> — {e.detail}</span>}
              </p>
            </li>
          ))}
          <li className="vy-fin pt-2 font-mono text-[0.85rem] text-soft">
            Author : {identite.prenom} {identite.nom.split(" ")[0].charAt(0) + identite.nom.split(" ")[0].slice(1).toLowerCase()}
          </li>
        </ol>

        {/* le compteur d'années */}
        <div aria-hidden="true" className="vy-anim vy-odo h-[1em] justify-self-end overflow-hidden font-display text-[clamp(4rem,13vw,10rem)] font-black leading-none tabular-nums text-ink/90">
          <div data-vy-annees className="flex flex-col">
            {etapes.map((e) => (
              <span key={e.titre} className="block h-[1em] leading-none">
                {annee(e.periode)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Parcours() {
  return (
    <section id="parcours" aria-labelledby="parcours-titre" className="relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-24 sm:px-8">
        <p className="label flex justify-between">
          <span>{identite.magazine} · Parcours</span>
          <span className="tabular-nums">p. 04-05</span>
        </p>
        <TitreAnime as="h2" id="parcours-titre" texte="Parcours" className="titre-xl mt-3 text-[clamp(3rem,11vw,6rem)]" />
        <hr className="filet mt-4" />
        <Voyage />
        <div className="vy-pied">
          <PiedDePage page="04-05" />
        </div>
      </div>
    </section>
  );
}
