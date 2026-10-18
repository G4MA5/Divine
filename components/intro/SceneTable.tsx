"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefs } from "../PrefsProvider";
import { Avatar, PIVOTS, type AvatarId } from "../avatar/Avatar";
import { MagazineObject } from "./MagazineObject";
import { play } from "@/lib/sound";
import { PRIO } from "@/lib/useScene";

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
          refreshPriority: PRIO.scene,
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

      {/* les accessoires : le soleil, une tasse, des plantes (tes illustrations) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-s="prop" aria-hidden="true" alt="" src="/images/illu/soleil-orange.svg" className="pointer-events-none absolute left-[2%] top-[3%] w-[26vw] max-w-[180px]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-s="prop" aria-hidden="true" alt="" src="/images/illu/plante-bleue.svg" className="pointer-events-none absolute right-[3%] top-[3%] w-[22vw] max-w-[150px]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-s="prop" aria-hidden="true" alt="" src="/images/illu/plante-corail.svg" className="pointer-events-none absolute bottom-[4%] right-[2%] w-[24vw] max-w-[170px]" />
      <svg data-s="prop" aria-hidden="true" viewBox="0 0 110 110" className="absolute right-[4%] top-[38%] w-[19vw] max-w-[120px]">
        <ellipse cx="55" cy="62" rx="48" ry="40" fill="#fff6ec" />
        <ellipse cx="55" cy="58" rx="34" ry="28" fill="#fff" stroke="#1f2d34" strokeWidth="2" />
        <ellipse cx="55" cy="58" rx="27" ry="21" fill="#4a2f1d" />
        <path d="M86 52c14 0 14 18 0 18" fill="none" stroke="#fff6ec" strokeWidth="7" />
        <path d="M44 56c6-4 14-4 20 0" stroke="#c89a6b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>

      <MagazineObject />

      {/* l'avatar choisi par le visiteur */}
      <div data-s="avatar" className="pointer-events-none absolute bottom-[2svh] left-0 z-10">
        <Avatar id={id} className="h-[48svh] w-auto" />
      </div>

      {/* voile final : la double page se fond dans le fond du Sommaire */}
      <div data-s="veil" aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-bg opacity-0" />

      <style>{`
        .scene .scene-table {
          background:
            radial-gradient(circle at 20% 15%, rgba(255,255,255,.35), transparent 45%),
            repeating-linear-gradient(135deg, rgba(31,45,52,.07) 0 3px, transparent 3px 22px),
            linear-gradient(180deg, #ffd24d, #ffc727 55%, #f5b300);
        }
        .scene[data-reduced] .scene-table, .scene[data-reduced] [data-s=prop], .scene[data-reduced] [data-s=avatar] { display: none; }
        html[data-theme="dark"] .scene .scene-table { filter: brightness(0.62) saturate(0.9); }
      `}</style>
    </section>
  );
}
