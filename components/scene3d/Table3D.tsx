"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Sprite } from "three";

/**
 * L'environnement du magazine : une table en bois clair, la lumière d'une fenêtre qui tombe dessus, et quelques objets
 * posés autour (tasse de café qui fume, stylo, lunettes, carnet, petite plante, flacon d'encre).
 * Repère local : x vers la droite, y vers le haut de la table, z vers le haut (hors de la table). Unité : largeur W du magazine.
 */

function canvas(w: number, h = w) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

const tex = (c: HTMLCanvasElement, repeat = false) => {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = RepeatWrapping;
  t.needsUpdate = true;
  return t;
};

/** Lames de chêne clair : teintes légèrement différentes, veinures, joints, quelques nœuds. Se répète sans raccord visible. */
function dessinerBois() {
  const S = 1024;
  const c = canvas(S);
  const ctx = c.getContext("2d")!;
  const lames = 5;
  const lw = S / lames;
  let graine = 7;
  const alea = () => {
    graine = (graine * 16807) % 2147483647;
    return (graine - 1) / 2147483646;
  };
  const teintes = ["#dcc29c", "#d6b98f", "#e0c9a6", "#d3b88c", "#dac19a"];
  for (let i = 0; i < lames; i++) {
    ctx.fillStyle = teintes[i];
    ctx.fillRect(i * lw, 0, lw, S);
    // veinures : courbes verticales périodiques (elles bouclent en haut et en bas)
    for (let k = 0; k < 46; k++) {
      const x0 = i * lw + alea() * lw;
      const amp = 2 + alea() * 7;
      const ph = alea() * Math.PI * 2;
      const freq = 1 + Math.floor(alea() * 3);
      ctx.strokeStyle = alea() > 0.5 ? `rgba(150,110,62,${0.05 + alea() * 0.1})` : `rgba(255,245,225,${0.05 + alea() * 0.08})`;
      ctx.lineWidth = 0.6 + alea() * 1.6;
      ctx.beginPath();
      for (let y = 0; y <= S; y += 8) {
        const x = x0 + Math.sin((y / S) * Math.PI * 2 * freq + ph) * amp;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // un nœud par lame, avec ses cernes
    const nx = i * lw + lw * (0.25 + alea() * 0.5);
    const ny = S * alea();
    for (let r = 14; r > 2; r -= 3) {
      ctx.strokeStyle = `rgba(120,84,44,${0.16 + (14 - r) * 0.01})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(nx, ny, r * 0.7, r * 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // joint entre les lames
    ctx.fillStyle = "rgba(96,66,34,0.55)";
    ctx.fillRect(i * lw, 0, 2.5, S);
  }
  return tex(c, true);
}

/** Lumière de fenêtre sur la table, et vignette sur les bords. */
function dessinerLumiere() {
  const c = canvas(512);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(236, 236, 10, 256, 256, 256);
  g.addColorStop(0, "rgba(255,248,230,0.34)");
  g.addColorStop(0.38, "rgba(255,248,230,0.08)");
  g.addColorStop(0.7, "rgba(70,48,24,0.12)");
  g.addColorStop(1, "rgba(60,40,20,0.42)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return tex(c);
}

function dessinerOmbre() {
  const c = canvas(128);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, "rgba(50,34,16,0.55)");
  g.addColorStop(0.6, "rgba(50,34,16,0.22)");
  g.addColorStop(1, "rgba(50,34,16,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return tex(c);
}

function dessinerVapeur() {
  const c = canvas(64);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return tex(c);
}

export function Environnement({ W }: { W: number }) {
  const bois = useMemo(() => {
    const t = dessinerBois();
    t.repeat.set(5, 5);
    return t;
  }, []);
  const lumiere = useMemo(dessinerLumiere, []);
  const ombre = useMemo(dessinerOmbre, []);
  const vapeur = useMemo(dessinerVapeur, []);
  const fumee = useRef<(Sprite | null)[]>([]);

  // la vapeur monte de la tasse, en boucle
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    fumee.current.forEach((sp, i) => {
      if (!sp) return;
      const ph = (t * 0.22 + i / 3) % 1;
      sp.position.set(Math.sin(ph * 6 + i * 2) * 0.02 * W, 0, 0.16 * W + ph * 0.3 * W);
      const o = Math.sin(ph * Math.PI) * 0.42;
      (sp.material as { opacity: number }).opacity = o;
      sp.scale.setScalar(W * (0.07 + ph * 0.11));
    });
  });

  const ombreAu = (x: number, y: number, w: number, h = w) => (
    <mesh position={[x, y, 0.5]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={ombre} transparent depthWrite={false} />
    </mesh>
  );

  return (
    <group>
      {/* la table */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[W * 26, W * 26]} />
        <meshLambertMaterial map={bois} />
      </mesh>
      {/* lumière et vignette */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[W * 9, W * 9]} />
        <meshBasicMaterial map={lumiere} transparent depthWrite={false} />
      </mesh>

      {/* ombres portées des objets (douces, sans bord dur) */}
      {ombreAu(W * 1.04, -W * 0.3, W * 0.42)}
      {ombreAu(W * 0.94, W * 0.22, W * 0.6, W * 0.12)}
      {ombreAu(W * 0.95, -W * 0.82, W * 0.36, W * 0.3)}
      {ombreAu(-W * 1.3, W * 0.98, W * 0.5)}
      {ombreAu(-W * 1.18, -W * 0.88, W * 0.2)}
      {ombreAu(-W * 1.28, W * 0.1, W * 0.34, W * 0.5)}

      {/* la tasse de café, sur sa soucoupe */}
      <group position={[W * 1.04, -W * 0.3, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.007 * W]}>
          <cylinderGeometry args={[0.13 * W, 0.12 * W, 0.014 * W, 40]} />
          <meshLambertMaterial color="#f4f1ea" />
        </mesh>
        <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.014 * W]}>
          <mesh position={[0, 0.05 * W, 0]}>
            <cylinderGeometry args={[0.085 * W, 0.07 * W, 0.1 * W, 40]} />
            <meshLambertMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.1015 * W, 0]}>
            <cylinderGeometry args={[0.076 * W, 0.076 * W, 0.004 * W, 40]} />
            <meshLambertMaterial color="#3f2716" />
          </mesh>
          <mesh position={[0, 0.1 * W, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.085 * W, 0.005 * W, 8, 40]} />
            <meshLambertMaterial color="#f2b400" />
          </mesh>
          <mesh position={[0.088 * W, 0.052 * W, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <torusGeometry args={[0.04 * W, 0.011 * W, 8, 20, Math.PI]} />
            <meshLambertMaterial color="#ffffff" />
          </mesh>
        </group>
        {[0, 1, 2].map((i) => (
          <sprite key={i} ref={(el) => (fumee.current[i] = el)} position={[0, 0, 0.2 * W]}>
            <spriteMaterial map={vapeur} transparent depthWrite={false} opacity={0} />
          </sprite>
        ))}
      </group>

      {/* le stylo */}
      <group position={[W * 0.94, W * 0.22, 0.012 * W]} rotation={[0, 0, 0.55]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012 * W, 0.012 * W, 0.46 * W, 14]} />
          <meshLambertMaterial color="#121212" />
        </mesh>
        <mesh position={[0.22 * W, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.012 * W, 0.05 * W, 14]} />
          <meshLambertMaterial color="#f2b400" />
        </mesh>
        <mesh position={[-0.2 * W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.013 * W, 0.013 * W, 0.06 * W, 14]} />
          <meshLambertMaterial color="#f2b400" />
        </mesh>
      </group>

      {/* les lunettes */}
      <group position={[W * 0.95, -W * 0.82, 0.006 * W]} rotation={[0, 0, -0.35]}>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.085 * W, 0, 0]}>
              <torusGeometry args={[0.065 * W, 0.006 * W, 8, 36]} />
              <meshLambertMaterial color="#121212" />
            </mesh>
            <mesh position={[s * 0.15 * W, -0.09 * W, 0]}>
              <boxGeometry args={[0.006 * W, 0.18 * W, 0.006 * W]} />
              <meshLambertMaterial color="#121212" />
            </mesh>
          </group>
        ))}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005 * W, 0.005 * W, 0.04 * W, 8]} />
          <meshLambertMaterial color="#121212" />
        </mesh>
      </group>

      {/* le carnet noir au ruban doré */}
      <group position={[-W * 1.28, W * 0.1, 0]} rotation={[0, 0, 0.18]}>
        <mesh position={[0, 0, 0.0175 * W]}>
          <boxGeometry args={[0.34 * W, 0.46 * W, 0.035 * W]} />
          <meshLambertMaterial color="#121212" />
        </mesh>
        <mesh position={[0.1 * W, 0, 0.0185 * W]}>
          <boxGeometry args={[0.022 * W, 0.462 * W, 0.037 * W]} />
          <meshLambertMaterial color="#f2b400" />
        </mesh>
      </group>

      {/* la petite plante */}
      <group position={[-W * 1.3, W * 0.98, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08 * W]}>
          <cylinderGeometry args={[0.1 * W, 0.07 * W, 0.16 * W, 28]} />
          <meshLambertMaterial color="#f4f1ea" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.12 * W]}>
          <cylinderGeometry args={[0.101 * W, 0.092 * W, 0.016 * W, 28]} />
          <meshLambertMaterial color="#121212" />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <group key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]}>
            <mesh position={[0.1 * W, 0, 0.26 * W + (i % 2) * 0.03 * W]} rotation={[0, -0.75 - (i % 3) * 0.12, 0]} scale={[0.17 * W, 0.045 * W, 0.016 * W]}>
              <sphereGeometry args={[1, 14, 8]} />
              <meshLambertMaterial color={i % 2 ? "#6f8a4b" : "#86a05a"} />
            </mesh>
          </group>
        ))}
      </group>

      {/* le flacon d'encre */}
      <group position={[-W * 1.18, -W * 0.88, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.045 * W]}>
          <cylinderGeometry args={[0.06 * W, 0.065 * W, 0.09 * W, 24]} />
          <meshLambertMaterial color="#121212" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1 * W]}>
          <cylinderGeometry args={[0.028 * W, 0.028 * W, 0.02 * W, 16]} />
          <meshLambertMaterial color="#f2b400" />
        </mesh>
      </group>
    </group>
  );
}
