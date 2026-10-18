"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefs } from "../PrefsProvider";
import { Avatar, PIVOTS, type AvatarId } from "../avatar/Avatar";
import { Couverture } from "./Couverture";
import { rubriques, pad, pageLabel } from "@/content/sections";
import { identite } from "@/content/identite";
import { play } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

/**
 * La scène de la table, pilotée par le scroll (section pinned) :
 *  1. la couverture recule et devient un magazine posé sur une table
 *  2. l'avatar entre par le côté et avance, un pas par cran de scroll
 *  3. il tend la main et prend le magazine
 *  4. il l'ouvre
 *  5. plongée dans la double page : on arrive sur le Sommaire
 * Le scroll arrière rembobine tout. Les mêmes étapes seront reprises par les fichiers Rive
 * (state machine pilotée par un input numérique 0 → 1, voir RIVE-SPEC.md).
 */
export function SceneTable() {
  const { avatar, reducedMotion, ready } = usePrefs();
  const racine = useRef<HTMLElement>(null);
  const id = (avatar ?? "curieuse") as AvatarId;

  useEffect(() => {
    const root = racine.current;
    if (!ready || reducedMotion || !root) return;

    const q = <T extends Element>(sel: string) => root.querySelector(sel) as T;
    const ctx = gsap.context(() => {
      const table = q<HTMLElement>("[data-s=table]");
      const props = gsap.utils.toArray<HTMLElement>("[data-s=prop]");
      const magPos = q<HTMLElement>("[data-s=mag-pos]");
      const cover = q<HTMLElement>("[data-s=cover-flip]");
      const avatarEl = q<HTMLElement>("[data-s=avatar]");
      const svg = avatarEl.querySelector("svg") as SVGSVGElement;
      const part = (n: keyof typeof PIVOTS) => svg.querySelector(`[data-part=${n}]`) as SVGGElement;
      const legL = part("legL");
      const legR = part("legR");
      const armL = part("armL");
      const armR = part("armR");
      const head = part("head");
      const veil = q<HTMLElement>("[data-s=veil]");
      (Object.keys(PIVOTS) as (keyof typeof PIVOTS)[]).forEach((k) => gsap.set(part(k), { transformOrigin: "0 0" }));

      const geo = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = Math.min(vw, vh * 0.75);
        return { vw, vh, w, h: (w * 4) / 3, mobile: vw < 768 };
      };

      gsap.set(table, { opacity: 0 });
      gsap.set(props, { opacity: 0, y: 30 });
      gsap.set(magPos, { transformPerspective: 1600, transformOrigin: "50% 50%" });
      gsap.set(cover, { transformOrigin: "0% 50%", rotationY: 0 });
      gsap.set(avatarEl, { x: () => -geo().vw * 0.75 });

      const marche = { p: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=560%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1 · recul de caméra : la couverture devient un magazine posé sur la table
      tl.to(magPos, { scale: () => (geo().mobile ? 0.5 : 0.44), rotationX: 54, y: () => geo().vh * 0.04, ease: "power2.inOut", duration: 2 }, 0)
        .to(table, { opacity: 1, duration: 1.6 }, 0.4)
        .to(props, { opacity: 1, y: 0, stagger: 0.12, duration: 1 }, 0.9);

      // 2 · l'avatar entre et marche vers la table, un pas par cran
      tl.to(avatarEl, { x: () => (geo().mobile ? geo().vw * 0.02 : geo().vw * 0.1), duration: 3.2, ease: "power1.out" }, 2)
        .to(
          marche,
          {
            p: 1,
            duration: 3.2,
            onUpdate: () => {
              const s = Math.sin(marche.p * Math.PI * 12) * 24 * (1 - Math.pow(marche.p, 6));
              gsap.set(legL, { rotation: s });
              gsap.set(legR, { rotation: -s });
              gsap.set(armL, { rotation: -s * 0.8 });
              gsap.set(armR, { rotation: s * 0.8 });
              gsap.set(avatarEl.firstElementChild, { y: -Math.abs(Math.sin(marche.p * Math.PI * 12)) * 4 });
            },
          },
          2,
        );

      // 3 · il tend la main, prend le magazine et le soulève
      const s3 = () => (geo().mobile ? 0.7 : 0.62);
      tl.fromTo(armR, { rotation: 0 }, { rotation: -112, duration: 1.1, immediateRender: false, ease: "power2.out" }, 5.4)
        .fromTo(head, { rotation: 0 }, { rotation: -6, duration: 1, immediateRender: false }, 5.4)
        .to(
          magPos,
          { scale: s3, rotationX: 16, y: () => geo().vh * (geo().mobile ? 0.1 : 0.12), x: () => -geo().vw * (geo().mobile ? 0.12 : 0.1), duration: 1.4, ease: "power2.inOut" },
          6.1,
        );

      // 4 · il l'ouvre (sur ordinateur la double page se recentre ; sur téléphone on garde la page de droite)
      tl.to(cover, { rotationY: -178, duration: 1.5, ease: "power1.inOut", onStart: () => play("page"), onReverseComplete: () => play("fermer") }, 7.5).to(
        magPos,
        { x: () => (geo().mobile ? 0 : (geo().w / 2) * s3()), y: () => geo().vh * 0.02, rotationX: 4, duration: 1.5, ease: "power1.inOut" },
        7.5,
      );

      // 5 · plongée dans la double page : elle remplit l'écran, puis fondu vers le Sommaire
      const plongee = { s: 0 };
      tl.to(
        plongee,
        {
          s: 1,
          duration: 2.2,
          ease: "power2.in",
          onUpdate: () => {
            const g = geo();
            const from = s3();
            const cible = g.mobile ? Math.max(g.vw / g.w, g.vh / g.h) * 1.02 : Math.max((g.vw * 1.04) / (2 * g.w), (g.vh * 1.04) / g.h);
            const sc = from + (cible - from) * plongee.s;
            gsap.set(magPos, { scale: sc, x: g.mobile ? 0 : (g.w / 2) * sc });
          },
        },
        9.2,
      )
        .to(magPos, { y: 0, rotationX: 0, duration: 2.2, ease: "power2.in" }, 9.2)
        .to([table, avatarEl, ...props], { opacity: 0, duration: 1.2 }, 9.4)
        .to(veil, { opacity: 1, duration: 0.8 }, 10.9);
    }, root);

    // un petit « tic » de feuille quand la scène s'ouvre ou se referme est joué par les callbacks ci-dessus
    return () => ctx.revert();
  }, [ready, reducedMotion, id]);

  const w = "min(100vw, 75svh)";

  return (
    <section
      id="scene"
      ref={racine}
      aria-label="Couverture du magazine"
      data-reduced={reducedMotion ? "" : undefined}
      className="scene relative h-svh w-full overflow-hidden bg-bg"
      style={{ ["--mw" as string]: w }}
    >
      {/* la table */}
      <div data-s="table" className="scene-table absolute inset-0" aria-hidden="true" />

      {/* les accessoires : lampe, tasse, plante (illustrations simples) */}
      <svg data-s="prop" aria-hidden="true" viewBox="0 0 120 150" className="absolute left-[3%] top-[4%] w-[22vw] max-w-[150px]">
        <defs>
          <radialGradient id="halo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f6d58a" stopOpacity=".75" />
            <stop offset="1" stopColor="#f6d58a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="42" r="56" fill="url(#halo)" />
        <path d="M34 60 50 14h20l16 46Z" fill="#a9812f" />
        <rect x="56" y="60" width="8" height="64" fill="#6f5320" />
        <ellipse cx="60" cy="130" rx="26" ry="8" fill="#6f5320" />
      </svg>
      <svg data-s="prop" aria-hidden="true" viewBox="0 0 110 110" className="absolute right-[4%] top-[38%] w-[19vw] max-w-[120px]">
        <ellipse cx="55" cy="62" rx="48" ry="40" fill="#f4ede0" />
        <ellipse cx="55" cy="58" rx="34" ry="28" fill="#fff" stroke="#d8cdb8" />
        <ellipse cx="55" cy="58" rx="27" ry="21" fill="#4a2f1d" />
        <path d="M86 52c14 0 14 18 0 18" fill="none" stroke="#f4ede0" strokeWidth="7" />
        <path d="M44 56c6-4 14-4 20 0" stroke="#c89a6b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
      <svg data-s="prop" aria-hidden="true" viewBox="0 0 120 150" className="absolute right-[3%] top-[2%] w-[20vw] max-w-[130px]">
        <path d="M60 140V70" stroke="#3d5a3c" strokeWidth="5" />
        <g fill="#4f7a4c">
          <path d="M60 110C30 104 18 80 22 52c26 4 40 24 38 58Z" />
          <path d="M60 100C90 92 104 70 100 40c-26 4-42 24-40 60Z" />
          <path d="M60 70C44 58 44 32 60 10c16 22 16 48 0 60Z" />
        </g>
        <path d="M36 128h48l-6 20H42Z" fill="#b4533a" />
      </svg>

      {/* le magazine */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1600px" }}>
        <div
          data-s="mag-pos"
          className="relative will-change-transform"
          style={{ width: "var(--mw)", height: "calc(var(--mw) * 4 / 3)", transformStyle: "preserve-3d" }}
        >
          {/* ombre portée */}
          <div className="absolute inset-0 shadow-[0_30px_60px_-20px_rgba(0,0,0,.55)]" aria-hidden="true" />

          {/* page de droite : le haut du sommaire */}
          <div className="absolute inset-0 bg-paper text-ink" style={{ containerType: "inline-size" }} aria-hidden="true">
            <div className="absolute inset-[7cqw]">
              <p className="font-sans uppercase tracking-[0.26em] text-ink/60" style={{ fontSize: "2.2cqw" }}>
                Ce qu&apos;il y a dans ce numéro
              </p>
              <ol className="mt-[6cqw]">
                {rubriques.slice(1, 8).map((r) => (
                  <li key={r.id} className="flex items-baseline gap-[2cqw] py-[1.5cqw] font-display italic" style={{ fontSize: "4.6cqw" }}>
                    <span>{r.titre}</span>
                    <span className="flex-1 border-b border-dotted border-gold/70" />
                    <span className="font-sans not-italic tabular-nums text-ink/60" style={{ fontSize: "2.4cqw" }}>
                      {pageLabel(r)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="absolute bottom-[4cqw] right-[7cqw] font-sans uppercase tracking-[0.2em] text-ink/50" style={{ fontSize: "2cqw" }}>
              {identite.magazine} — p. 03
            </p>
          </div>

          {/* la couverture, qui pivote autour de la reliure */}
          <div data-s="cover-flip" className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
              <Couverture />
            </div>
            {/* dos de la couverture = page de gauche du sommaire */}
            <div
              className="absolute inset-0 bg-paper text-ink"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", containerType: "inline-size" }}
              aria-hidden="true"
            >
              <div className="absolute inset-[7cqw]">
                <p className="font-sans uppercase tracking-[0.26em] text-ink/60" style={{ fontSize: "2.2cqw" }}>
                  {identite.magazine}
                </p>
                <h2 className="mt-[14cqw] font-display italic leading-none text-gold" style={{ fontSize: "16cqw" }}>
                  Sommaire
                </h2>
                <hr className="mt-[6cqw] border-0 border-t border-gold/70" />
                <p className="mt-[4cqw] font-display italic text-ink/70" style={{ fontSize: "4cqw" }}>
                  Six reportages, une interview et quelques surprises.
                </p>
              </div>
              <p className="absolute bottom-[4cqw] left-[7cqw] font-sans uppercase tracking-[0.2em] text-ink/50" style={{ fontSize: "2cqw" }}>
                p. {pad(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* l'avatar choisi par le visiteur */}
      <div data-s="avatar" className="pointer-events-none absolute bottom-[2svh] left-0 z-10">
        <Avatar id={id} className="h-[48svh] w-auto" />
      </div>

      {/* voile final : la double page se fond dans le fond du Sommaire */}
      <div data-s="veil" aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-bg opacity-0" />

      <style>{`
        .scene .scene-table {
          background:
            repeating-linear-gradient(90deg, rgba(110,72,34,.10) 0 2px, transparent 2px 11px),
            repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 37px),
            linear-gradient(180deg, #dcc59b, #c9a877 60%, #bd9a68);
        }
        .scene[data-reduced] .scene-table, .scene[data-reduced] [data-s=prop], .scene[data-reduced] [data-s=avatar] { display: none; }
        html[data-theme="dark"] .scene .scene-table { filter: brightness(0.5) saturate(0.85); }
      `}</style>
    </section>
  );
}
