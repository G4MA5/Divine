"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { creerPersonnage, type IdPerso } from "./Personnage";

/**
 * Le salon de l'interview en 3D : le personnage du visiteur (tête de tournesol) pose les questions à Divine (tête de
 * lys rose à pois), assis face à face autour d'une petite table. La scène suit doucement le pointeur. Quand une question est
 * posée (`parle` augmente), le visiteur lève la main et une bulle « ? » apparaît ; Divine répond d'un hochement de tête et
 * d'une bulle « … ».
 */

function enTexture(c: HTMLCanvasElement) {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
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
    camera.position.set(0, 0.5, size.width < 560 ? 10.6 : 8.2);
    camera.lookAt(0, 0.1, 0);
  }, [camera, size.width]);
  return null;
}

type Textures = { ombre: CanvasTexture; tapis: CanvasTexture; ask: CanvasTexture; rep: CanvasTexture };

const SOL = -1.75;

function Tabouret({ x }: { x: number }) {
  return (
    <group position={[x, SOL, 0]}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 28]} />
        <meshLambertMaterial color="#5a4636" />
      </mesh>
      {[
        [-0.28, -0.28],
        [0.28, -0.28],
        [-0.28, 0.28],
        [0.28, 0.28],
      ].map(([a, b], i) => (
        <mesh key={i} position={[a, 0.2, b]}>
          <cylinderGeometry args={[0.035, 0.035, 0.42, 8]} />
          <meshLambertMaterial color="#5a4636" />
        </mesh>
      ))}
    </group>
  );
}

function Salon({ t, parle, avatarId }: { t: Textures; parle: number; avatarId: IdPerso }) {
  const racine = useRef<Group>(null);
  const bAsk = useRef<Mesh>(null);
  const bRep = useRef<Mesh>(null);
  const last = useRef(parle);
  const depuis = useRef(99);
  const pointer = useRef({ x: 0, y: 0 });
  const visiteur = useMemo(() => {
    const p = creerPersonnage(avatarId);
    p.asseoir(true);
    p.racine.rotation.y = 0.62;
    return p;
  }, [avatarId]);
  const divine = useMemo(() => {
    const p = creerPersonnage("divine");
    p.asseoir(true);
    p.racine.rotation.y = -0.62;
    return p;
  }, []);

  useEffect(() => () => visiteur.liberer(), [visiteur]);
  useEffect(() => () => divine.liberer(), [divine]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

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
      racine.current.rotation.y += (pointer.current.x * 0.2 - racine.current.rotation.y) * 0.06;
      racine.current.rotation.x += (-pointer.current.y * 0.05 - racine.current.rotation.x) * 0.06;
    }
    // le visiteur respire ; quand il pose sa question, il lève la main
    const lever = d < 1.4 ? Math.sin(Math.min(1, d / 1.4) * Math.PI) : 0;
    visiteur.corps.position.y = Math.sin(t0 * 1.7) * 0.02;
    visiteur.brasD.rotation.x = -2.0 * Math.min(1, lever * 1.4);
    visiteur.avantBrasD.rotation.x = -0.6 * lever;
    visiteur.tete.rotation.z = Math.sin(t0 * 1.1) * 0.04 - lever * 0.08;
    // Divine écoute, puis répond d'un hochement de tête
    const hoche = d > 0.55 && d < 1.4 ? Math.sin(((d - 0.55) / 0.85) * Math.PI * 2) * 0.16 : 0;
    divine.corps.position.y = Math.sin(t0 * 1.3 + 1) * 0.018;
    divine.tete.rotation.x = hoche;
    divine.tete.rotation.z = Math.sin(t0 * 0.9 + 2) * 0.05;
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

  // pieds au sol : une fois assis, les pieds sont à 0,43 au-dessus de l'origine du personnage
  const yPerso = SOL - 0.43 + 0.06;
  return (
    <group ref={racine}>
      {/* le sol : un tapis clair et les ombres des tabourets */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SOL - 0.02, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial map={t.tapis} transparent depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.0, SOL, 0.1]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshBasicMaterial map={t.ombre} transparent depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.0, SOL, 0.1]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshBasicMaterial map={t.ombre} transparent depthWrite={false} />
      </mesh>

      {/* la petite table entre les deux : un plateau doré et un magazine posé dessus */}
      <group position={[0, SOL + 0.6, 0.2]}>
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

      {/* le visiteur (à gauche) et Divine (à droite), assis sur leur tabouret */}
      <Tabouret x={-2.1} />
      <Tabouret x={2.1} />
      <group position={[-2.1, yPerso, 0.05]}>
        <primitive object={visiteur.racine} />
        <mesh ref={bAsk} position={[0.7, 3.5, 0.3]}>
          <planeGeometry args={[0.85, 0.85]} />
          <meshBasicMaterial map={t.ask} transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <group position={[2.1, yPerso, 0.05]}>
        <primitive object={divine.racine} />
        <mesh ref={bRep} position={[-0.75, 3.6, 0.3]}>
          <planeGeometry args={[0.85, 0.85]} />
          <meshBasicMaterial map={t.rep} transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function Contenu({ avatarId, parle, onPret }: { avatarId: IdPerso; parle: number; onPret: () => void }) {
  const [t, setT] = useState<Textures | null>(null);
  const invalider = useThree((st) => st.invalidate);

  // rendu à environ 30 images par seconde : assez pour la respiration des personnages, deux fois moins lourd
  useEffect(() => {
    const id = setInterval(invalider, 33);
    return () => clearInterval(id);
  }, [invalider]);

  useEffect(() => {
    setT({ ombre: disque("40,34,20", 0.35, 0.16), tapis: disque("214,208,190", 0.55, 0.3), ask: bulle("?", "#f2b400"), rep: bulle("…", "#121212") });
  }, []);

  useEffect(() => {
    if (!t) return;
    const id = setTimeout(onPret, 120);
    return () => clearTimeout(id);
  }, [t, onPret]);

  return (
    <>
      <Camera />
      <ambientLight intensity={2.1} />
      <directionalLight position={[-3, 6, 6]} intensity={1.3} />
      {t && <Salon t={t} parle={parle} avatarId={avatarId} />}
    </>
  );
}

export default function Studio3D({ avatarId, parle, onPret }: { avatarId: IdPerso; parle: number; onPret: () => void }) {
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
    <div ref={boite} aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Canvas flat dpr={[1, 1.5]} frameloop={visible ? "demand" : "never"} camera={{ fov: 33, near: 0.1, far: 60 }} gl={{ alpha: true, antialias: false }} style={{ background: "transparent", pointerEvents: "none" }}>
        <Suspense fallback={null}>
          <Contenu avatarId={avatarId} parle={parle} onPret={onPret} />
        </Suspense>
      </Canvas>
    </div>
  );
}
