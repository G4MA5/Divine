"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { creerPersonnage, HAUTEUR_PERSO, type IdPerso } from "./Personnage";

/**
 * Le personnage 3D qui marche vers la table, prend le magazine et le ferme. Il est piloté par la même scène GSAP que
 * l'ancienne version à plat : on lit la position, la marche et l'angle des bras de l'avatar SVG (devenu invisible) et on
 * les applique aux articulations du corps 3D.
 */
export type SourcePerso = {
  el: HTMLElement;
  parts: { legL: Element; legR: Element; armL: Element; armR: Element; head: Element };
  /** de quel côté de l'écran il entre */
  ancre: "gauche" | "droite";
};

const DEG = Math.PI / 180;
const DISTANCE = 1600;
const Z = 500; // le personnage est devant la table : on compense la perspective pour qu'il garde sa taille à l'écran
const lire = (el: Element, p: string, defaut: number) => {
  const v = Number(gsap.getProperty(el, p));
  return Number.isFinite(v) ? v : defaut;
};

export function Perso3D({ id, src, reduit }: { id: IdPerso; src: SourcePerso; reduit: boolean }) {
  const { size, invalidate } = useThree();
  const perso = useMemo(() => {
    const p = creerPersonnage(id);
    p.racine.traverse((o) => (o.renderOrder = 3)); // après la table et le voile blanc
    return p;
  }, [id]);
  const opacite = useRef(-1);
  const etat = useRef({ x: 0, bob: 0, miroir: 1, o: 1, lG: 0, lD: 0, aG: 0, aD: 0, tete: 0 });

  useEffect(() => () => perso.liberer(), [perso]);

  // lecture de la scène GSAP, une fois par image ; on demande un nouveau dessin si quelque chose a bougé
  useEffect(() => {
    let dernier = "";
    const tick = () => {
      const e = etat.current;
      e.x = lire(src.el, "x", 0);
      e.miroir = lire(src.el, "scaleX", 1) < 0 ? -1 : 1;
      const enfant = src.el.firstElementChild;
      e.bob = enfant ? lire(enfant, "y", 0) : 0;
      const brut = parseFloat(src.el.style.opacity);
      e.o = reduit ? 0 : Number.isFinite(brut) ? Math.min(1, Math.max(0, brut)) : 1;
      e.lG = lire(src.parts.legL, "rotation", 0);
      e.lD = lire(src.parts.legR, "rotation", 0);
      e.aG = lire(src.parts.armL, "rotation", 0);
      e.aD = lire(src.parts.armR, "rotation", 0);
      e.tete = lire(src.parts.head, "rotation", 0);
      const sig = `${e.x.toFixed(1)}|${e.bob.toFixed(1)}|${e.miroir}|${e.o.toFixed(2)}|${e.lG.toFixed(1)}|${e.aD.toFixed(1)}|${e.tete.toFixed(1)}`;
      if (sig !== dernier) {
        dernier = sig;
        invalidate();
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [src, reduit, invalidate]);

  useFrame(() => {
    const e = etat.current;
    const f = (DISTANCE - Z) / DISTANCE;
    const vh = size.height;
    const vw = size.width;
    const Hc = 0.48 * vh; // hauteur à l'écran de l'avatar (48 svh), comme avant
    const larg = (Hc * 160) / 360;
    const centre = src.ancre === "gauche" ? -vw / 2 + larg / 2 + e.x : vw / 2 - larg / 2 + e.x;
    const pieds = -vh / 2 + 0.045 * vh;
    const r = perso.racine;
    r.scale.setScalar((Hc * f) / HAUTEUR_PERSO);
    r.position.set(centre * f, (pieds - e.bob) * f, Z);
    r.rotation.y = e.miroir * 0.85; // il regarde vers la table
    perso.jambeG.rotation.x = e.lG * DEG;
    perso.jambeD.rotation.x = e.lD * DEG;
    perso.molletG.rotation.x = Math.max(0, e.lG) * DEG * 0.9;
    perso.molletD.rotation.x = Math.max(0, e.lD) * DEG * 0.9;
    perso.brasG.rotation.x = e.aG * DEG;
    perso.brasD.rotation.x = e.aD * DEG;
    perso.avantBrasD.rotation.x = e.aD < -30 ? -0.55 : 0;
    perso.tete.rotation.x = e.tete * DEG * 0.6;
    if (Math.abs(opacite.current - e.o) > 0.005) {
      opacite.current = e.o;
      perso.matieres.forEach((m) => (m.opacity = e.o));
    }
    r.visible = e.o > 0.01;
  });

  return <primitive object={perso.racine} />;
}
