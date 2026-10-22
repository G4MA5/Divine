"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, type Group, type MeshBasicMaterial, type PerspectiveCamera } from "three";
import gsap from "gsap";
import { creerTextures, type JeuTextures, type Variante } from "./texturesLivre";

/**
 * Le magazine en vraie 3D (three.js, via React Three Fiber).
 * Les unités sont des pixels : l'objet a la taille de la couverture CSS et la caméra reproduit la perspective de 1600 px.
 * La scène GSAP continue de piloter deux éléments invisibles (data-s="mag-pos" et "cover-flip") : à chaque image, on lit
 * leur position, leur échelle, leur inclinaison et l'angle d'ouverture de la couverture, et on les applique au livre.
 */
const DEG = Math.PI / 180;
const DISTANCE = 1600;

type Sources = { pos: HTMLElement; cover: HTMLElement };

const lire = (el: HTMLElement, p: string, defaut: number) => {
  const v = Number(gsap.getProperty(el, p));
  return Number.isFinite(v) ? v : defaut;
};

function Camera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    cam.fov = (2 * Math.atan(size.height / 2 / DISTANCE)) / DEG;
    cam.near = 200;
    cam.far = 5000;
    cam.position.set(0, 0, DISTANCE);
    cam.updateProjectionMatrix();
  }, [camera, size.height]);
  return null;
}

/** Ombre douce sous le livre : un dégradé radial, plus large quand la couverture s'ouvre. */
function creerOmbre() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 126);
  g.addColorStop(0, "rgba(40,34,20,0.38)");
  g.addColorStop(0.55, "rgba(40,34,20,0.18)");
  g.addColorStop(1, "rgba(40,34,20,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new CanvasTexture(c);
}

function Livre({ tex, src }: { tex: JeuTextures; src: Sources }) {
  const { size } = useThree();
  const groupe = useRef<Group>(null);
  const charniere = useRef<Group>(null);
  const ombreG = useRef<Group>(null);
  const matOmbre = useRef<MeshBasicMaterial>(null);
  const W = Math.min(size.width, size.height * 0.75);
  const H = (W * 4) / 3;
  const T = W * 0.07; // épaisseur totale du bloc de pages
  const tR = T / 2;
  const tL = T / 2;
  const c = W * 0.014; // épaisseur de la couverture
  const ombre = useMemo(creerOmbre, []);

  useFrame(() => {
    const g = groupe.current;
    const h = charniere.current;
    if (!g || !h) return;
    const x = lire(src.pos, "x", 0);
    const y = lire(src.pos, "y", 0);
    const s = lire(src.pos, "scale", 1);
    const rx = lire(src.pos, "rotationX", 0);
    const ouvert = lire(src.cover, "rotationY", 0);
    g.position.set(x, -y, 0);
    g.scale.setScalar(s);
    g.rotation.x = -rx * DEG;
    h.rotation.y = ouvert * DEG;
    if (ombreG.current) ombreG.current.scale.x = 1 + Math.min(1, Math.abs(ouvert) / 178);
    // l'ombre n'existe vraiment que lorsque le livre est posé sur la table (incliné)
    if (matOmbre.current) matOmbre.current.opacity = 0.18 + 0.82 * Math.min(1, Math.max(0, rx) / 40);
  });

  return (
    <group ref={groupe}>
      {/* ombre posée sur la table, sous le livre */}
      <group ref={ombreG} position={[0, 0, -2]}>
        <mesh position={[-W * 0.0, -H * 0.04, 0]}>
          <planeGeometry args={[W * 1.5, H * 1.18]} />
          <meshBasicMaterial ref={matOmbre} map={ombre} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* pile de pages de droite */}
      <mesh position={[0, 0, tR / 2]} castShadow>
        <boxGeometry args={[W, H, tR]} />
        <meshLambertMaterial attach="material-0" map={tex.papierU} />
        <meshLambertMaterial attach="material-1" color="#e9e5da" />
        <meshLambertMaterial attach="material-2" map={tex.papierV} />
        <meshLambertMaterial attach="material-3" map={tex.papierV} />
        <meshLambertMaterial attach="material-4" map={tex.droite} />
        <meshLambertMaterial attach="material-5" color="#ffffff" />
      </mesh>

      {/* charnière sur la reliure : la couverture et la pile de gauche pivotent ensemble */}
      <group ref={charniere} position={[-W / 2, 0, tR]}>
        {/* pile de gauche : sa face du dessous est la page de gauche */}
        <mesh position={[W / 2, 0, tL / 2]}>
          <boxGeometry args={[W, H, tL]} />
          <meshLambertMaterial attach="material-0" map={tex.papierU} />
          <meshLambertMaterial attach="material-1" color="#e9e5da" />
          <meshLambertMaterial attach="material-2" map={tex.papierV} />
          <meshLambertMaterial attach="material-3" map={tex.papierV} />
          <meshLambertMaterial attach="material-4" color="#f4f2ec" />
          <meshLambertMaterial attach="material-5" map={tex.gauche} />
        </mesh>
        {/* la couverture : sa face extérieure est la une */}
        <mesh position={[W / 2, 0, tL + c / 2]}>
          <boxGeometry args={[W, H, c]} />
          <meshLambertMaterial attach="material-0" color="#ffffff" />
          <meshLambertMaterial attach="material-1" color="#ffffff" />
          <meshLambertMaterial attach="material-2" color="#ffffff" />
          <meshLambertMaterial attach="material-3" color="#ffffff" />
          <meshLambertMaterial attach="material-4" map={tex.couverture} />
          <meshLambertMaterial attach="material-5" color="#f4f2ec" />
        </mesh>
      </group>
    </group>
  );
}

function Scene({ variante, src, onPret, portrait, cvDispo }: { variante: Variante; src: Sources; onPret: () => void; portrait: string | null; cvDispo: boolean }) {
  const [tex, setTex] = useState<JeuTextures | null>(null);

  useEffect(() => {
    let vivant = true;
    creerTextures(variante, { portrait, cvDispo }).then((t) => {
      if (!vivant) return;
      setTex(t);
    });
    return () => {
      vivant = false;
    };
  }, [variante, portrait, cvDispo]);

  // une fois les textures posées, deux images plus tard le livre 3D est à l'écran : on masque la version CSS
  useEffect(() => {
    if (!tex) return;
    let n = 0;
    let raf = 0;
    const boucle = () => {
      if (++n >= 3) return onPret();
      raf = requestAnimationFrame(boucle);
    };
    raf = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(raf);
  }, [tex, onPret]);

  return (
    <>
      <Camera />
      <ambientLight intensity={2.1} />
      <directionalLight position={[-500, 800, 1100]} intensity={1.35} />
      {tex && <Livre tex={tex} src={src} />}
    </>
  );
}

export default function Livre3D({ variante, src, onPret, portrait, cvDispo }: { variante: Variante; src: Sources; onPret: () => void; portrait: string | null; cvDispo: boolean }) {
  const boite = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // pas d'image calculée quand la scène est hors de l'écran
  useEffect(() => {
    const el = boite.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={boite} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
      <Canvas flat dpr={[1, 1.75]} frameloop={visible ? "always" : "never"} gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, DISTANCE], fov: 30 }} style={{ background: "transparent" }}>
        <Scene variante={variante} src={src} onPret={onPret} portrait={portrait} cvDispo={cvDispo} />
      </Canvas>
    </div>
  );
}
