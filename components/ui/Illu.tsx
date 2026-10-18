/* eslint-disable @next/next/no-img-element */

/**
 * Une illustration d'ambiance (dans /public/images/illu), posée en absolu dans une section `relative`.
 * `anim` la fait flotter, respirer ou tourner ; `vitesse` la décale au scroll (parallaxe, voir <Parallaxe />).
 * className reçoit la position et la largeur (ex. « left-[4%] top-10 w-28 »).
 */
export function Illu({
  src,
  className = "",
  anim,
  rot = 0,
  vitesse,
  delai = 0,
}: {
  src: string;
  className?: string;
  anim?: "flotte" | "respire" | "tourne";
  rot?: number;
  /** amplitude de la parallaxe (≈ 1 = légère, 3 = marquée ; le signe donne le sens) */
  vitesse?: number;
  delai?: number;
}) {
  return (
    <span aria-hidden="true" data-vitesse={vitesse} className={`pointer-events-none absolute block select-none ${className}`} style={{ rotate: `${rot}deg` }}>
      <img
        src={`/images/illu/${src}`}
        alt=""
        draggable={false}
        loading="lazy"
        className={`block h-auto w-full ${anim ?? ""}`}
        style={{ ["--r" as string]: "0deg", animationDelay: `${delai}s` }}
      />
    </span>
  );
}
