/**
 * Un champ de tournesols pour le pied de page (SVG dessiné ici, sans image) : trois rangées qui se chevauchent,
 * chaque fleur se balance doucement à son rythme. Les positions sont calculées de façon déterministe
 * (aucun hasard : le rendu est identique côté serveur et côté navigateur).
 */

/** arrondi à 2 décimales : le serveur et le navigateur ne calculent pas les sinus à la même précision */
const n2 = (v: number) => Math.round(v * 100) / 100;

const alea = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return n2(x - Math.floor(x));
};

type Fleur = { x: number; hauteur: number; taille: number; inclinaison: number; delai: number; rangee: number };

function genere(): Fleur[] {
  const fleurs: Fleur[] = [];
  const rangees = [
    { n: 15, h: [96, 150], t: [20, 27], y: 0 },
    { n: 17, h: [78, 128], t: [24, 32], y: 1 },
    { n: 19, h: [52, 104], t: [27, 38], y: 2 },
  ];
  let k = 0;
  rangees.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      k++;
      fleurs.push({
        x: n2(((i + 0.5 + (alea(k) - 0.5) * 0.85) / r.n) * 1200),
        hauteur: n2(r.h[0] + alea(k + 40) * (r.h[1] - r.h[0])),
        taille: n2(r.t[0] + alea(k + 80) * (r.t[1] - r.t[0])),
        inclinaison: n2((alea(k + 120) - 0.5) * 16),
        delai: n2(alea(k + 160) * -5),
        rangee: ri,
      });
    }
  });
  return fleurs;
}

const FLEURS = genere();

function Tournesol({ f }: { f: Fleur }) {
  const base = 250;
  const teteY = base - f.hauteur;
  const r = f.taille;
  const petales = 16;
  const teinte = f.rangee === 0 ? ["#e8a900", "#c98f00"] : f.rangee === 1 ? ["#f2b400", "#dca100"] : ["#ffc61a", "#f0b000"];
  const feuille = f.rangee === 0 ? "#6b8a3a" : f.rangee === 1 ? "#7a9a41" : "#86a64a";
  return (
    <g transform={`translate(${f.x} 0)`}>
      <g className="balance" style={{ ["--r" as string]: `${f.inclinaison}deg`, animationDelay: `${f.delai}s`, transformOrigin: `0px ${base}px` }}>
      {/* tige et feuilles */}
      <path d={`M0 ${base} C ${n2(-4)} ${n2(base - f.hauteur * 0.4)}, ${3} ${n2(base - f.hauteur * 0.75)}, 0 ${teteY}`} fill="none" stroke="#5a7a2c" strokeWidth={n2(Math.max(2.4, r * 0.13))} strokeLinecap="round" />
      <path d={`M0 ${n2(base - f.hauteur * 0.38)} q ${n2(-r * 1.25)} ${n2(-r * 0.2)} ${n2(-r * 1.5)} ${n2(-r * 0.95)} q ${n2(r * 1.1)} ${n2(r * 0.05)} ${n2(r * 1.5)} ${n2(r * 0.95)}Z`} fill={feuille} />
      <path d={`M0 ${n2(base - f.hauteur * 0.2)} q ${n2(r * 1.25)} ${n2(-r * 0.2)} ${n2(r * 1.45)} ${n2(-r * 0.95)} q ${n2(-r * 1.1)} ${n2(r * 0.05)} ${n2(-r * 1.45)} ${n2(r * 0.95)}Z`} fill={feuille} opacity=".95" />
      {/* tête : pétales puis cœur */}
      <g transform={`translate(0 ${teteY})`}>
        {Array.from({ length: petales }, (_, i) => (
          <ellipse key={i} cx="0" cy={n2(-r * 0.98)} rx={n2(r * 0.24)} ry={n2(r * 0.5)} fill={teinte[i % 2]} transform={`rotate(${n2((360 / petales) * i)})`} />
        ))}
        <circle r={n2(r * 0.62)} fill="#4e3418" />
        <circle r={n2(r * 0.46)} fill="#6a4a22" />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={n2(Math.cos((i / 9) * 6.283) * r * 0.3)} cy={n2(Math.sin((i / 9) * 6.283) * r * 0.3)} r={n2(r * 0.045)} fill="#3b2710" />
        ))}
      </g>
      </g>
    </g>
  );
}

export function Tournesols({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className={className}>
      {FLEURS.map((f, i) => (
        <Tournesol key={i} f={f} />
      ))}
      <rect y="248" width="1200" height="12" fill="#5a7a2c" />
    </svg>
  );
}
