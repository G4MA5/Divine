"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { renderToStaticMarkup } from "react-dom/server";
import { Avatar, type AvatarId, VIEWBOX_H, VIEWBOX_W } from "../avatar/Avatar";

/**
 * Le salon de l'interview en 3D : l'avatar du visiteur (l'intervieweur) et Divine se font face autour d'une petite table.
 * Les personnages sont des silhouettes découpées posées dans l'espace (la caméra suit doucement le pointeur), avec une
 * ombre au sol. Quand une question est posée (`parle` augmente), l'intervieweur sursaute et une bulle « ? » apparaît ;
 * Divine répond d'un petit hochement et d'une bulle « … ».
 */

const charger = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

function enTexture(c: HTMLCanvasElement) {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/** L'avatar SVG devient une texture (le SVG est dessiné dans un canvas). */
async function textureAvatar(id: AvatarId) {
  const svg = renderToStaticMarkup(<Avatar id={id} pose="assis" />)
    .replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEWBOX_W * 6}" height="${VIEWBOX_H * 6}" `);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const img = await charger(url);
  URL.revokeObjectURL(url);
  const c = document.createElement("canvas");
  c.width = VIEWBOX_W * 6;
  c.height = VIEWBOX_H * 6;
  if (img) c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return { tex: enTexture(c), ratio: VIEWBOX_W / VIEWBOX_H };
}

async function texturePortrait(src: string | null) {
  const c = document.createElement("canvas");
  c.width = 442;
  c.height = 890;
  const ctx = c.getContext("2d")!;
  const img = src ? await charger(src) : null;
  if (img) ctx.drawImage(img, 0, 0, c.width, c.height);
  else {
    ctx.fillStyle = "#121212";
    ctx.fill(new Path2D("M0 890c10-190 100-258 220-288l80-24h40l80 24c120 30 212 98 222 288Z"));
    ctx.beginPath();
    ctx.ellipse(221, 300, 120, 150, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return { tex: enTexture(c), ratio: c.width / c.height };
}

/** Disque doux : sert d'ombre au sol et de tapis. */
function disque(rgb: string, a0: number, a1: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 126);
  g.addColorStop(0, `rgba(${rgb},${a0})`);
  g.addColorStop(0.7, `rgba(${rgb},${a1})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return enTexture(c);
}

/** Une bulle de dialogue (« ? » ou « … ») dessinée dans un canvas. */
function bulle(texte: string, couleur: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = couleur;
  ctx.beginPath();
  ctx.roundRect(28, 28, 200, 150, 52);
  ctx.moveTo(70, 170);
  ctx.lineTo(54, 230);
  ctx.lineTo(112, 176);
  ctx.fill();
  ctx.fillStyle = couleur === "#121212" ? "#ffffff" : "#121212";
  ctx.font = "900 108px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texte, 128, 104);
  return enTexture(c);
}

function Camera() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.3, size.width < 560 ? 11.5 : 9.2);
    camera.lookAt(0, -0.2, 0);
  }, [camera, size.width]);
  return null;
}

type Textures = { avatar: { tex: CanvasTexture; ratio: number }; portrait: { tex: CanvasTexture; ratio: number }; ombre: CanvasTexture; tapis: CanvasTexture; ask: CanvasTexture; rep: CanvasTexture };

function Salon({ t, parle }: { t: Textures; parle: number }) {
  const racine = useRef<Group>(null);
  const av = useRef<Group>(null);
  const po = useRef<Group>(null);
  const bAsk = useRef<Mesh>(null);
  const bRep = useRef<Mesh>(null);
  const last = useRef(parle);
  const depuis = useRef(99);
  const pointer = useThree((s) => s.pointer);

  useFrame((s, dt) => {
    const t0 = s.clock.elapsedTime;
    if (parle !== last.current) {
      last.current = parle;
      depuis.current = 0;
    }
    depuis.current += dt;
    const d = depuis.current;
    // parallaxe douce vers le pointeur
    if (racine.current) {
      racine.current.rotation.y += (pointer.x * 0.22 - racine.current.rotation.y) * 0.06;
      racine.current.rotation.x += (-pointer.y * 0.06 - racine.current.rotation.x) * 0.06;
    }
    // souffle : les deux personnages respirent
    if (av.current) {
      const saut = d < 0.5 ? Math.sin((d / 0.5) * Math.PI) * 0.22 : 0;
      av.current.position.y = -0.1 + Math.sin(t0 * 1.7) * 0.025 + saut;
    }
    if (po.current) {
      const hoche = d > 0.55 && d < 1.2 ? Math.sin(((d - 0.55) / 0.65) * Math.PI) * 0.05 : 0;
      po.current.position.y = -0.05 + Math.sin(t0 * 1.3 + 1) * 0.02;
      po.current.rotation.z = hoche;
    }
    // les bulles apparaissent puis s'estompent
    const op = (m: Mesh | null, debut: number) => {
      if (!m) return;
      const x = d - debut;
      const o = x < 0 ? 0 : x < 0.2 ? x / 0.2 : x < 1.3 ? 1 : Math.max(0, 1 - (x - 1.3) / 0.4);
      (m.material as MeshBasicMaterial).opacity = o;
      m.scale.setScalar(0.8 + 0.2 * Math.min(1, Math.max(0, x / 0.2)));
    };
    op(bAsk.current, 0.05);
    op(bRep.current, 0.6);
  });

  const hA = 3.3;
  const hP = 3.7;
  return (
    <group ref={racine}>
      {/* le sol : un tapis clair et des ombres */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.78, 0]}>
        <planeGeometry args={[9.5, 9.5]} />
        <meshBasicMaterial map={t.tapis} transparent depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.1, -1.76, 0.1]}>
        <planeGeometry args={[2.6, 1.3]} />
        <meshBasicMaterial map={t.ombre} transparent depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.0, -1.76, 0.1]}>
        <planeGeometry args={[2.8, 1.3]} />
        <meshBasicMaterial map={t.ombre} transparent depthWrite={false} />
      </mesh>

      {/* la petite table entre les deux : un plateau doré et un magazine posé dessus */}
      <group position={[0, -1.35, 0.3]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.07, 48]} />
          <meshLambertMaterial color="#f2b400" />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.55, 16]} />
          <meshLambertMaterial color="#121212" />
        </mesh>
        <mesh position={[0, -0.48, 0]}>
          <cylinderGeometry args={[0.32, 0.36, 0.05, 32]} />
          <meshLambertMaterial color="#121212" />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.55, 0.05, 0.72]} />
          <meshLambertMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* l'intervieweur (à gauche, tourné vers Divine) */}
      <group ref={av} position={[-2.0, -0.1, 0]} rotation={[0, 0.38, 0]}>
        <mesh position={[0, hA / 2 - 1.68, 0]}>
          <planeGeometry args={[hA * t.avatar.ratio, hA]} />
          <meshBasicMaterial map={t.avatar.tex} transparent alphaTest={0.02} />
        </mesh>
        <mesh ref={bAsk} position={[0.6, hA - 1.95, 0.1]}>
          <planeGeometry args={[0.85, 0.85]} />
          <meshBasicMaterial map={t.ask} transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* le bureau de l'interview, devant Divine : il cache le bas de la découpe */}
      <group position={[2.0, -1.43, 0.55]} rotation={[0, -0.34, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 0.75, 0.5]} />
          <meshLambertMaterial color="#f4f1ea" />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <boxGeometry args={[2.56, 0.05, 0.56]} />
          <meshLambertMaterial color="#f2b400" />
        </mesh>
      </group>

      {/* Divine (à droite) */}
      <group ref={po} position={[2.0, -0.05, 0]} rotation={[0, -0.34, 0]}>
        <mesh position={[0, hP / 2 - 1.68, 0]}>
          <planeGeometry args={[hP * t.portrait.ratio, hP]} />
          <meshBasicMaterial map={t.portrait.tex} transparent alphaTest={0.02} />
        </mesh>
        <mesh ref={bRep} position={[-0.75, hP - 2.05, 0.1]}>
          <planeGeometry args={[0.85, 0.85]} />
          <meshBasicMaterial map={t.rep} transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function Contenu({ avatarId, portrait, parle, onPret }: { avatarId: AvatarId; portrait: string | null; parle: number; onPret: () => void }) {
  const [t, setT] = useState<Textures | null>(null);

  useEffect(() => {
    let vivant = true;
    Promise.all([textureAvatar(avatarId), texturePortrait(portrait)]).then(([avatar, por]) => {
      if (!vivant) return;
      setT({ avatar, portrait: por, ombre: disque("40,34,20", 0.35, 0.16), tapis: disque("214,208,190", 0.55, 0.3), ask: bulle("?", "#f2b400"), rep: bulle("…", "#121212") });
    });
    return () => {
      vivant = false;
    };
  }, [avatarId, portrait]);

  useEffect(() => {
    if (!t) return;
    const id = setTimeout(onPret, 120);
    return () => clearTimeout(id);
  }, [t, onPret]);

  return (
    <>
      <Camera />
      <ambientLight intensity={2.4} />
      <directionalLight position={[-3, 6, 6]} intensity={1.2} />
      {t && <Salon t={t} parle={parle} />}
    </>
  );
}

export default function Studio3D({ avatarId, parle, portrait, onPret }: { avatarId: AvatarId; parle: number; portrait: string | null; onPret: () => void }) {
  const boite = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = boite.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={boite} aria-hidden="true" className="absolute inset-0">
      <Canvas flat dpr={[1, 1.75]} frameloop={visible ? "always" : "never"} camera={{ fov: 33, near: 0.1, far: 60 }} gl={{ alpha: true, antialias: true }} style={{ background: "transparent" }}>
        <Suspense fallback={null}>
          <Contenu avatarId={avatarId} portrait={portrait} parle={parle} onPret={onPret} />
        </Suspense>
      </Canvas>
    </div>
  );
}
