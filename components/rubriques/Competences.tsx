"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { competences } from "@/content/competences";
import { Page } from "./Page";
import { Illu } from "../ui/Illu";
import { gsap, useScene } from "@/lib/useScene";
import { play } from "@/lib/sound";

/**
 * p. 16 — Boîte à outils (reprise de la couverture typographique de mon autre projet)
 * Une « couverture » noire faite uniquement de mots : chaque outil est un gros mot qui monte quand il entre à l'écran,
 * réagit au pointeur, et chaque ligne glisse de côté en sens inverse au fil du scroll. Le tampon compte les outils.
 * Les tailles sont écrites en px pour une couverture de 1312 px de large puis converties en unités de conteneur :
 * toute la composition rétrécit d'un seul bloc.
 */

const C = {
  bg: "#111111",
  fg: "#FFFFFF",
  a1: "#E4002B",
  a2: "#00A3E0",
  a3: "#F5C400",
  a4: "#E6007E",
  muted: "#5A5A5A",
  soft: "#BDBDBD",
};

const cq = (px: number) => `${(px / 13.12).toFixed(3)}cqw`;
const fs = (px: number, min = 16) => `max(${min}px, ${cq(px)})`;

type Face = "bo" | "it" | "sa";

function Sup({ n, color }: { n: string; color?: string }) {
  return (
    <span className="tb-sp" style={{ color }}>
      {n}
    </span>
  );
}

/** Un gros mot : il monte quand il entre dans la vue et réagit au pointeur. */
function Word({ face, size, color = C.fg, outline, weight, children }: { face: Face; size: number; color?: string; outline?: string; weight?: number; children: ReactNode }) {
  const style: CSSProperties & Record<string, string | number> = { fontSize: fs(size) };
  if (outline) {
    style.color = "transparent";
    style.WebkitTextStroke = `max(1px, ${cq(2)}) ${outline}`;
    style["--oc"] = outline;
  } else {
    style.color = color;
  }
  if (weight) style.fontWeight = weight;
  return (
    <span data-mot className={`tb-w tb-${face}${outline ? " tb-out" : ""}`} style={style}>
      {children}
    </span>
  );
}

/** Une rangée de la couverture ; son contenu dérive de côté pendant le scroll, en sens alternés. */
function Line({ children, last, dir }: { children: ReactNode; last?: boolean; dir: 1 | -1 }) {
  return (
    <div data-ligne data-dir={dir} className="tb-lw" style={{ borderBottom: last ? 0 : `1px solid ${C.muted}` }}>
      <div data-derive className="tb-ln">
        {children}
      </div>
    </div>
  );
}

function Couverture() {
  const ref = useRef<HTMLDivElement>(null);

  useScene(ref, (root) => {
    // le titre, lettre par lettre
    gsap.from(root.querySelectorAll("[data-t]"), {
      opacity: 0,
      yPercent: 50,
      rotation: 4,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.035,
      scrollTrigger: { trigger: root.querySelector("[data-titre]"), start: "top 85%", once: true, onEnter: () => play("papier") },
    });

    // le filet rouge se trace
    gsap.from(root.querySelector("[data-filet]"), { scaleX: 0, transformOrigin: "left", duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: root.querySelector("[data-filet]"), start: "top 90%", once: true } });

    // chaque rangée : ses mots montent, et son contenu dérive selon le scroll
    gsap.utils.toArray<HTMLElement>("[data-ligne]", root).forEach((ligne) => {
      const dir = Number(ligne.dataset.dir);
      const mots = ligne.querySelectorAll("[data-mot]");
      gsap.from(mots, { opacity: 0, yPercent: 32, duration: 0.8, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: ligne, start: "top 88%", once: true, onEnter: () => play("tic") } });
      gsap.fromTo(
        ligne.querySelector("[data-derive]"),
        { x: () => -dir * root.clientWidth * 0.018 },
        { x: () => dir * root.clientWidth * 0.018, ease: "none", scrollTrigger: { trigger: ligne, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } },
      );
    });

    // les lettres verticales « WEB » tombent avec un rebond
    gsap.from(root.querySelectorAll("[data-vt] span"), { opacity: 0, yPercent: -120, duration: 0.9, ease: "bounce.out", stagger: 0.14, scrollTrigger: { trigger: root.querySelector("[data-vt]"), start: "top 88%", once: true } });

    // le tampon : il tourne en arrivant et compte jusqu'à 13
    const n = root.querySelector("[data-n]") as HTMLElement;
    const c = { v: 0 };
    gsap.fromTo(root.querySelector("[data-tampon]"), { scale: 0.3, rotation: -80, opacity: 0 }, { scale: 1, rotation: -10, opacity: 1, duration: 1.1, ease: "back.out(2)", scrollTrigger: { trigger: root.querySelector("[data-tampon]"), start: "top 90%", once: true } });
    gsap.to(c, { v: 13, duration: 1.4, ease: "power2.out", onUpdate: () => (n.textContent = String(Math.round(c.v))), scrollTrigger: { trigger: root.querySelector("[data-tampon]"), start: "top 90%", once: true, onEnter: () => play("tampon") } });
  });

  const titre = "BOÎTE À OUTILS";

  return (
    <div ref={ref} className="tools-cover mt-10" style={{ background: C.bg, color: C.fg }}>
      <div className="tools-in">
        <div className="tb-ca tb-top" style={{ fontSize: fs(13, 9) }}>
          <span>Divine</span>
          <span>Le numéro technique</span>
          <span style={{ color: C.a1 }}>Édition 2026</span>
        </div>

        <h3 data-titre className="tb-bo tb-title" style={{ fontSize: fs(124, 20) }} aria-label={titre}>
          {[...titre].map((ch, i) => (
            <span key={i} data-t aria-hidden="true" style={{ display: "inline-block", whiteSpace: "pre" }}>
              {ch}
            </span>
          ))}
        </h3>

        <div data-filet aria-hidden="true" style={{ height: 2, background: C.a1, marginTop: 10 }} />
        <div className="tb-ca tb-strip" style={{ fontSize: fs(12, 8), borderBottom: `1px solid ${C.muted}` }}>
          <span>13 outils</span>
          <span style={{ color: C.a1 }}>·</span>
          <span>Mobile · Web · Back-end · Données</span>
          <span style={{ color: C.a1 }}>·</span>
          <span>Spécial savoir-faire</span>
        </div>

        <Line dir={1}>
          <Word face="sa" size={196} color={C.a1}>
            FLUTTER
            <Sup n="01" />
          </Word>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: cq(12), alignSelf: "center" }}>
            <Word face="it" size={64}>
              &amp; Firebase
              <Sup n="02" color={C.a1} />
            </Word>
            <span className="tb-ca" style={{ fontSize: fs(13, 9), color: C.soft }}>
              Le mobile, sans compromis
            </span>
          </span>
        </Line>

        <Line dir={-1}>
          <span data-vt className="tb-vt" style={{ color: C.a1, fontSize: fs(30, 14) }} aria-hidden="true">
            {["W", "E", "B"].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </span>
          <Word face="bo" size={132}>
            React
            <Sup n="03" color={C.a1} />
          </Word>
          <Word face="sa" size={124} weight={400} outline={C.a2}>
            Next.js
            <Sup n="04" color={C.a2} />
          </Word>
          <Word face="it" size={64} color={C.a3}>
            TypeScript
            <Sup n="05" />
          </Word>
        </Line>

        <Line dir={1}>
          <Word face="it" size={156} color={C.a4}>
            FastAPI
            <Sup n="06" />
          </Word>
          <Word face="sa" size={112}>
            Python
            <Sup n="07" color={C.a1} />
          </Word>
          <span style={{ display: "flex", flexDirection: "column", gap: 6, alignSelf: "center", textAlign: "right" }}>
            <span className="tb-ca" style={{ fontSize: fs(13, 9) }}>
              Les coulisses
            </span>
            <span className="tb-it" style={{ fontSize: fs(22, 14), color: C.soft }}>
              API, scripts &amp; services
            </span>
          </span>
        </Line>

        <Line dir={-1}>
          <Word face="bo" size={118}>
            SPRING BOOT
            <Sup n="08" color={C.a1} />
          </Word>
          <Word face="it" size={80} color={C.a1}>
            &amp; Java
            <Sup n="09" />
          </Word>
        </Line>

        <Line dir={1}>
          <Word face="sa" size={104} weight={400} outline={C.fg}>
            Supabase
            <Sup n="10" color={C.fg} />
          </Word>
          <Word face="it" size={84} color={C.a2}>
            Oracle
            <Sup n="11" />
          </Word>
          <Word face="bo" size={100} color={C.a3}>
            DOCKER
            <Sup n="12" />
          </Word>
        </Line>

        <div className="tb-foot">
          <span style={{ lineHeight: 0.9 }}>
            <span className="tb-it" style={{ fontSize: fs(56, 18) }}>
              …et un peu d’
            </span>
            <Word face="sa" size={124} color={C.a1}>
              UML
              <Sup n="13" />
            </Word>
          </span>
          <span style={{ display: "flex", alignItems: "flex-end", gap: cq(28) }}>
            <span data-tampon className="tb-seal" style={{ width: `max(72px, ${cq(132)})`, height: `max(72px, ${cq(132)})`, background: C.a1 }}>
              <span data-n className="tb-it" style={{ fontSize: fs(46, 24), lineHeight: 1 }}>
                13
              </span>
              <span className="tb-ca" style={{ fontSize: fs(11, 7), lineHeight: 1.4 }}>
                outils
                <br />
                maîtrisés
              </span>
            </span>
            <span className="tb-barcode" style={{ width: `max(92px, ${cq(134)})` }} aria-hidden="true">
              <svg viewBox="0 0 96 48" style={{ width: "100%", display: "block" }}>
                <path
                  d="M2 0v48M6 0v48M9 0v48M14 0v48M16 0v48M21 0v48M26 0v48M28 0v48M33 0v48M37 0v48M40 0v48M45 0v48M48 0v48M53 0v48M57 0v48M59 0v48M64 0v48M68 0v48M71 0v48M76 0v48M80 0v48M83 0v48M88 0v48M91 0v48M94 0v48"
                  stroke="#111"
                  strokeWidth="1.8"
                />
              </svg>
              <span className="tb-ca" style={{ fontSize: 9, color: "#111", letterSpacing: "0.3em" }}>
                N°13 · ABIDJAN
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Tout le détail, par famille (et indexable : le texte reste dans la page). */
function Familles() {
  return (
    <section aria-label="Mes compétences par famille" className="mt-12">
      <h3 className="label !text-fg">Tout le détail, par famille</h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {competences.map((c) => (
          <div key={c.categorie} className="border-[3px] border-ink bg-paper p-4 text-ink shadow-[5px_5px_0_#1f2d34]">
            <dt className="titre-xl text-3xl">{c.categorie}</dt>
            <dd className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {c.items.map((it) => (
                <span key={it} className="label !text-ink">
                  {it}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Competences() {
  return (
    <Page
      id="competences"
      titre="Boîte à outils"
      couleur="creme"
      large
      decor={
        <>
          <Illu src="soleil-jaune.svg" className="-right-[10%] top-[3%] w-[36vw] max-w-[240px]" anim="respire" vitesse={1.5} />
          <Illu src="plante-bleue.svg" className="-bottom-[1%] -left-[2%] z-20 w-[18vw] max-w-[120px]" anim="respire" vitesse={-1} />
          <Illu src="plante-corail.svg" className="-bottom-[1%] -right-[2%] z-20 w-[18vw] max-w-[120px]" anim="respire" delai={1} vitesse={-1.5} />
          <Illu src="etoile.svg" className="left-[44%] top-[3%] w-[6vw] max-w-[36px]" anim="tourne" />
        </>
      }
    >
      <Couverture />
      <Familles />
    </Page>
  );
}
