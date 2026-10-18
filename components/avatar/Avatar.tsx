import { forwardRef, type ReactNode } from "react";

/**
 * Avatars de remplacement en SVG, animés par GSAP en attendant les vrais fichiers Rive
 * (voir RIVE-SPEC.md). Les parties mobiles portent un attribut data-part :
 * legL, legR, armL, armR, head, body. Les pivots sont posés par la scène (svgOrigin).
 */

export type AvatarId = "recruteur" | "curieuse" | "client" | "etudiante";

type Style = {
  skin: string;
  hair: string;
  outfit: string;
  outfit2: string;
  trousers: string;
  shoes: string;
};

export const STYLES: Record<AvatarId, Style> = {
  recruteur: { skin: "#8a5a3c", hair: "#1b1512", outfit: "#2f5fe0", outfit2: "#fff6ec", trousers: "#1f2d34", shoes: "#111" },
  curieuse: { skin: "#c68b62", hair: "#1a110d", outfit: "#ff725e", outfit2: "#ffc727", trousers: "#ff725e", shoes: "#1f2d34" },
  client: { skin: "#efc7a4", hair: "#5a3b2a", outfit: "#22c55e", outfit2: "#fff6ec", trousers: "#1f2d34", shoes: "#fff6ec" },
  etudiante: { skin: "#6b4330", hair: "#0f0a08", outfit: "#8e3fa6", outfit2: "#ffc727", trousers: "#1f2d34", shoes: "#ffc727" },
};

/** Pivots (coordonnées du viewBox) : chaque partie mobile tourne autour de son point d'attache. */
export const PIVOTS = {
  legL: [69, 214],
  legR: [91, 214],
  armL: [52, 136],
  armR: [108, 136],
  head: [80, 104],
} as const;

type Part = keyof typeof PIVOTS;

/** Une partie mobile : on l'ancre à son pivot, elle tourne donc autour de (0,0) de son propre repère. */
function Mobile({ part, children, rot }: { part: Part; children: ReactNode; rot?: number }) {
  const [x, y] = PIVOTS[part];
  return (
    <g transform={`translate(${x} ${y})`}>
      <g data-part={part} transform={rot ? `rotate(${rot})` : undefined}>
        <g transform={`translate(${-x} ${-y})`}>{children}</g>
      </g>
    </g>
  );
}

export const VIEWBOX_W = 160;
export const VIEWBOX_H = 360;

function Hair({ id, c }: { id: AvatarId; c: string }) {
  switch (id) {
    case "recruteur":
      return <path d="M52 74c0-20 12-31 28-31s28 11 28 31c-6-9-14-13-28-13s-22 4-28 13Z" fill={c} />;
    case "curieuse":
      return (
        <g fill={c}>
          <circle cx="80" cy="62" r="34" />
          <circle cx="52" cy="76" r="14" />
          <circle cx="108" cy="76" r="14" />
        </g>
      );
    case "client":
      return <path d="M50 80c-4-26 10-42 30-42s34 16 30 42c-2-12-8-22-20-24-10 6-26 6-40 24Z" fill={c} />;
    case "etudiante":
      return (
        <g fill={c}>
          <path d="M52 76c0-22 12-34 28-34s28 12 28 34c-8-10-16-14-28-14s-20 4-28 14Z" />
          <rect x="104" y="62" width="14" height="42" rx="7" />
          <rect x="42" y="62" width="14" height="42" rx="7" />
        </g>
      );
  }
}

function Outfit({ id, s }: { id: AvatarId; s: Style }) {
  switch (id) {
    case "recruteur":
      return (
        <g data-part="body">
          <rect x="46" y="118" width="68" height="116" rx="22" fill={s.outfit} />
          <path d="M70 118l10 36 10-36Z" fill={s.outfit2} />
          <path d="M77 124h6l3 38-6 8-6-8Z" fill="#ff725e" />
        </g>
      );
    case "curieuse":
      return (
        <g data-part="body">
          <path d="M50 118h60l16 128H34Z" fill={s.outfit} />
          <path d="M66 118c4 10 24 10 28 0Z" fill={s.outfit2} />
        </g>
      );
    case "client":
      return (
        <g data-part="body">
          <rect x="46" y="118" width="68" height="114" rx="22" fill={s.outfit} />
          <rect x="72" y="118" width="16" height="114" fill={s.outfit2} opacity="0.9" />
          <rect x="56" y="196" width="22" height="30" rx="4" fill="#2b3340" />
        </g>
      );
    case "etudiante":
      return (
        <g data-part="body">
          <rect x="46" y="118" width="68" height="112" rx="24" fill={s.outfit} />
          <path d="M66 118c2 14 26 14 28 0Z" fill={s.outfit2} />
          <rect x="52" y="124" width="9" height="62" rx="4" fill="#3a2a33" />
          <rect x="99" y="124" width="9" height="62" rx="4" fill="#3a2a33" />
        </g>
      );
  }
}

export const Avatar = forwardRef<SVGSVGElement, { id: AvatarId; className?: string; title?: string; pose?: "debout" | "assis" }>(function Avatar(
  { id, className, title, pose = "debout" },
  ref,
) {
  const s = STYLES[id];
  const jambes = id === "curieuse" ? s.skin : s.trousers;
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <ellipse cx="80" cy="351" rx="42" ry="6" fill="#000" opacity="0.18" />
      {/* jambes */}
      {pose === "assis" ? (
        <g>
          {/* le siège */}
          <rect x="30" y="226" width="86" height="12" rx="4" fill="#5a4636" />
          <rect x="34" y="236" width="8" height="112" rx="3" fill="#5a4636" />
          <rect x="104" y="236" width="8" height="112" rx="3" fill="#5a4636" />
          {/* cuisses vers l'avant, mollets vers le bas */}
          <rect x="62" y="206" width="76" height="18" rx="9" fill={jambes} />
          <rect x="124" y="214" width="17" height="116" rx="8" fill={jambes} />
          <ellipse cx="136" cy="334" rx="15" ry="6.5" fill={s.shoes} />
        </g>
      ) : (
        <>
      <Mobile part="legL">
        <rect x="61" y="214" width="17" height="128" rx="8" fill={jambes} />
        <ellipse cx="68" cy="344" rx="14" ry="6.5" fill={s.shoes} />
      </Mobile>
      <Mobile part="legR">
        <rect x="82" y="214" width="17" height="128" rx="8" fill={jambes} />
        <ellipse cx="92" cy="344" rx="14" ry="6.5" fill={s.shoes} />
      </Mobile>
        </>
      )}
      {/* bras gauche (derrière le torse) */}
      <Mobile part="armL">
        <rect x="42" y="128" width="15" height="92" rx="7.5" fill={id === "curieuse" ? s.skin : s.outfit} />
        <circle cx="49.5" cy="224" r="8.5" fill={s.skin} />
      </Mobile>
      <Outfit id={id} s={s} />
      {/* bras droit (devant) */}
      <Mobile part="armR" rot={pose === "assis" ? -62 : undefined}>
        <rect x="103" y="128" width="15" height="92" rx="7.5" fill={id === "curieuse" ? s.skin : s.outfit} />
        <circle cx="110.5" cy="224" r="8.5" fill={s.skin} />
        {pose === "assis" && <rect x="100" y="206" width="26" height="34" rx="3" fill="#f1e9da" stroke="#ff725e" strokeWidth="2" />}
      </Mobile>
      {/* tête */}
      <Mobile part="head">
        {id === "etudiante" && <rect x="40" y="72" width="80" height="6" rx="3" fill="#2a2a2a" />}
        <rect x="72" y="96" width="16" height="26" rx="6" fill={s.skin} />
        <Hair id={id} c={s.hair} />
        <ellipse cx="80" cy="80" rx="25" ry="28" fill={s.skin} />
        {/* cheveux de face, par-dessus le front */}
        {id === "recruteur" && <path d="M55 70c3-14 13-20 25-20s22 6 25 20c-8-6-16-8-25-8s-17 2-25 8Z" fill={s.hair} />}
        {id === "client" && <path d="M55 72c0-16 10-26 25-26s25 10 25 26c-10-12-20-14-30-12-8 2-14 6-20 12Z" fill={s.hair} />}
        {id === "curieuse" && <path d="M56 68c2-14 12-22 24-22s22 8 24 22c-10-8-16-10-24-10s-14 2-24 10Z" fill={s.hair} />}
        {id === "etudiante" && <path d="M55 70c3-14 13-20 25-20s22 6 25 20c-8-6-16-8-25-8s-17 2-25 8Z" fill={s.hair} />}
        {/* visage */}
        <circle cx="70" cy="82" r="2.4" fill="#1a1410" />
        <circle cx="90" cy="82" r="2.4" fill="#1a1410" />
        <path d="M72 94c4 4 12 4 16 0" fill="none" stroke="#1a1410" strokeWidth="2" strokeLinecap="round" />
        {id === "curieuse" && (
          <g fill="none" stroke="#1a1410" strokeWidth="2">
            <circle cx="70" cy="82" r="8" />
            <circle cx="90" cy="82" r="8" />
            <path d="M78 82h4" />
          </g>
        )}
        {id === "etudiante" && (
          <g fill="#2a2a2a">
            <rect x="36" y="70" width="10" height="26" rx="5" />
            <rect x="114" y="70" width="10" height="26" rx="5" />
          </g>
        )}
      </Mobile>
    </svg>
  );
});
