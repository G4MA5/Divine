import {
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Material,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  BoxGeometry,
} from "three";

/**
 * Les personnages du magazine, en vrai 3D : un corps (torse, bras, jambes à deux segments) et une TÊTE DE FLEUR.
 * Les visiteurs ont une tête de tournesol (un visage sur le cœur) ; Divine a une tête de lys rose à pois.
 * Aucun trait de genre : les silhouettes sont les mêmes, seules changent les tenues et les fleurs.
 *
 * Le personnage regarde vers +z. Les articulations sont des groupes qu'on fait tourner (rotation.x : vers l'avant / l'arrière) :
 *  racine > corps > { tête, bras G/D (> avant-bras), } et racine > { jambe G/D (> mollet) }.
 */
export type IdPerso = "recruteur" | "curieuse" | "client" | "etudiante" | "divine";

export const HAUTEUR_PERSO = 3.4;

export type Personnage = {
  racine: Group;
  corps: Group;
  tete: Group;
  brasG: Group;
  brasD: Group;
  avantBrasD: Group;
  jambeG: Group;
  jambeD: Group;
  molletG: Group;
  molletD: Group;
  /** matériaux qui portent l'opacité (le personnage apparaît et disparaît en fondu) */
  matieres: MeshLambertMaterial[];
  /** assis (cuisses à l'horizontale, mollets vers le bas) ou debout */
  asseoir: (assis: boolean) => void;
  liberer: () => void;
};

type Style = {
  fleur: "tournesol" | "lys";
  petales: [string, string];
  coeur: string;
  haut: string;
  haut2: string;
  bas: string;
  chaussures: string;
  accessoire: "carnet" | "lunettes" | "tablette" | "sac" | "magazine";
};

const STYLES: Record<IdPerso, Style> = {
  recruteur: { fleur: "tournesol", petales: ["#f2b400", "#ffcf3a"], coeur: "#5a3b1c", haut: "#22304f", haut2: "#ffffff", bas: "#22304f", chaussures: "#111111", accessoire: "carnet" },
  curieuse: { fleur: "tournesol", petales: ["#f0a800", "#ffd24a"], coeur: "#5a3b1c", haut: "#f1e9da", haut2: "#8aa376", bas: "#8aa376", chaussures: "#f1e9da", accessoire: "lunettes" },
  client: { fleur: "tournesol", petales: ["#e8890c", "#f7b13a"], coeur: "#4a2f17", haut: "#4a4d52", haut2: "#e9e6dd", bas: "#2b2d31", chaussures: "#ffffff", accessoire: "tablette" },
  etudiante: { fleur: "tournesol", petales: ["#f7d34a", "#fff0a0"], coeur: "#5a3b1c", haut: "#d99a00", haut2: "#f1e9da", bas: "#2b2b2b", chaussures: "#ffffff", accessoire: "sac" },
  divine: { fleur: "lys", petales: ["#f472b6", "#fbcfe8"], coeur: "#be185d", haut: "#141414", haut2: "#2a2a2a", bas: "#141414", chaussures: "#ffffff", accessoire: "magazine" },
};

const PEAU = "#f1e9da"; // mains : crème, pour ne rien suggérer
const TIGE = "#5a7a2c";
const DEG = Math.PI / 180;

/* ───────── textures dessinées dans des canvas ───────── */

function canvas(w: number, h = w) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

const tex = (c: HTMLCanvasElement) => {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
};

/** Le cœur du tournesol : des graines en spirale, deux yeux et un sourire. */
function visageTournesol(coeur: string) {
  const c = canvas(256);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, "#7a5628");
  g.addColorStop(0.6, coeur);
  g.addColorStop(1, "#3a2410");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const or = Math.PI * (3 - Math.sqrt(5));
  ctx.fillStyle = "rgba(30,18,8,0.45)";
  for (let i = 1; i < 150; i++) {
    const r = 6.6 * Math.sqrt(i);
    const a = i * or;
    ctx.beginPath();
    ctx.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // yeux et sourire (le haut du visage est en haut de l'image)
  ctx.fillStyle = "#1a1109";
  [96, 160].forEach((x) => {
    ctx.beginPath();
    ctx.ellipse(x, 106, 14, 19, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#ffffff";
  [96, 160].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x + 4, 98, 5.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = "#1a1109";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(128, 136, 42, 0.22 * Math.PI, 0.78 * Math.PI);
  ctx.stroke();
  const t = tex(c);
  // le haut du dessin doit être vers le haut du visage une fois posé sur le disque
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI / 2;
  return t;
}

/** Un pétale de lys rose : dégradé du cœur clair vers la pointe, nervure claire et petits points rose foncé. */
function petaleLys(cols: [string, string], pois: string) {
  const W = 256;
  const H = 512;
  const c = canvas(W, H);
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, H, 0, 0); // v=0 en bas (base), tip en haut
  g.addColorStop(0, "#fff3f8");
  g.addColorStop(0.3, cols[1]);
  g.addColorStop(1, cols[0]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // nervure centrale plus claire
  const n = ctx.createLinearGradient(W * 0.42, 0, W * 0.58, 0);
  n.addColorStop(0, "rgba(255,255,255,0)");
  n.addColorStop(0.5, "rgba(255,255,255,0.45)");
  n.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = n;
  ctx.fillRect(W * 0.42, 0, W * 0.16, H * 0.85);
  // les points : plus nombreux dans la moitié basse, un peu plus gros près de la nervure
  let graine = 11;
  const alea = () => {
    graine = (graine * 16807) % 2147483647;
    return (graine - 1) / 2147483646;
  };
  for (let i = 0; i < 64; i++) {
    const v = 0.06 + alea() * 0.7; // hauteur dans le pétale (depuis la base)
    const largeur = Math.sin(Math.PI * Math.pow(v + 0.04, 0.75));
    const x = W / 2 + (alea() - 0.5) * W * 0.62 * largeur;
    const y = H * (1 - v);
    const r = 3.2 + alea() * 4.2;
    ctx.fillStyle = pois;
    ctx.globalAlpha = 0.55 + alea() * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return tex(c);
}

/* ───────── géométries ───────── */

/** Un pétale pointu qui se courbe vers l'arrière : longueur L, largeur Wd, courbure `courbe`. */
function geometriePetale(L: number, Wd: number, courbe: number) {
  const seg = 14;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const demi = (Wd / 2) * Math.sin(Math.PI * Math.pow(Math.min(1, t * 0.98 + 0.02), 0.72));
    const y = t * L;
    const z = -courbe * t * t * L;
    pos.push(-demi, y, z, demi, y, z);
    uv.push(0.5 - (demi / Wd) * 0.98, t, 0.5 + (demi / Wd) * 0.98, t);
    if (i < seg) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ───────── les têtes ───────── */

function teteTournesol(s: Style, mats: MeshLambertMaterial[], liberables: { dispose: () => void }[]) {
  const g = new Group();
  const m = (color: string) => {
    const x = new MeshLambertMaterial({ color, transparent: true });
    mats.push(x);
    liberables.push(x);
    return x;
  };
  // le cœur : un disque brun tourné vers l'avant, avec le visage dessiné dessus
  const visage = visageTournesol(s.coeur);
  liberables.push(visage);
  const coeurG = new CylinderGeometry(0.46, 0.46, 0.2, 40);
  coeurG.rotateX(Math.PI / 2);
  liberables.push(coeurG);
  const bord = m(s.coeur);
  const face = new MeshLambertMaterial({ map: visage, transparent: true });
  mats.push(face);
  liberables.push(face);
  const coeur = new Mesh(coeurG, [bord, face, bord]);
  g.add(coeur);
  // deux rangées de pétales autour du cœur
  const pet = new SphereGeometry(1, 14, 8);
  liberables.push(pet);
  const mA = m(s.petales[0]);
  const mB = m(s.petales[1]);
  const N = 18;
  for (let rang = 0; rang < 2; rang++) {
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + rang * (Math.PI / N);
      const p = new Mesh(pet, rang === 0 ? mA : mB);
      const r = rang === 0 ? 0.72 : 0.62;
      p.scale.set(0.15, rang === 0 ? 0.36 : 0.3, 0.05);
      p.position.set(Math.cos(a) * r, Math.sin(a) * r, rang === 0 ? -0.07 : -0.02);
      p.rotation.z = a - Math.PI / 2;
      g.add(p);
    }
  }
  return g;
}

function teteLys(s: Style, mats: MeshLambertMaterial[], liberables: { dispose: () => void }[]) {
  const g = new Group();
  const texPetale = petaleLys(s.petales, s.coeur);
  liberables.push(texPetale);
  const grand = geometriePetale(1.05, 0.46, 0.32);
  const petit = geometriePetale(0.92, 0.4, 0.3);
  liberables.push(grand, petit);
  const mat = new MeshLambertMaterial({ map: texPetale, side: DoubleSide, transparent: true });
  mats.push(mat);
  liberables.push(mat);
  // six tépales : trois grands, trois plus petits entre eux
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const grandP = i % 2 === 0;
    const p = new Mesh(grandP ? grand : petit, mat);
    const pivot = new Group();
    pivot.rotation.z = a - Math.PI / 2; // la pointe part vers l'angle a
    pivot.position.z = grandP ? -0.03 : 0.0;
    p.position.set(0, 0.05, 0);
    p.rotation.x = -0.18; // le pétale se renverse un peu vers l'arrière
    pivot.add(p);
    g.add(pivot);
  }
  // gorge du lys
  const gorgeG = new SphereGeometry(0.13, 16, 12);
  liberables.push(gorgeG);
  const gorgeM = new MeshLambertMaterial({ color: "#e8f08a", transparent: true });
  mats.push(gorgeM);
  liberables.push(gorgeM);
  const gorge = new Mesh(gorgeG, gorgeM);
  gorge.position.z = 0.0;
  gorge.scale.set(1, 1, 0.6);
  g.add(gorge);
  // étamines : de fins filaments qui s'arquent vers l'avant, avec des anthères brun orangé
  const filG: TubeGeometry[] = [];
  const filM = new MeshLambertMaterial({ color: "#d6e07a", transparent: true });
  const antM = new MeshLambertMaterial({ color: "#b45309", transparent: true });
  mats.push(filM, antM);
  liberables.push(filM, antM);
  const antG = new SphereGeometry(0.05, 10, 8);
  liberables.push(antG);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const bout = new Vector3(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0.34);
    const courbe = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0.2), bout]);
    const tg = new TubeGeometry(courbe, 12, 0.012, 6, false);
    filG.push(tg);
    liberables.push(tg);
    g.add(new Mesh(tg, filM));
    const ant = new Mesh(antG, antM);
    ant.position.copy(bout);
    ant.scale.set(1, 1, 2.2);
    ant.lookAt(bout.clone().multiplyScalar(2).add(new Vector3(0, 0, 0.3)));
    g.add(ant);
  }
  // le pistil, plus long, terminé par trois petits lobes roses
  const pc = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(0, -0.05, 0.22), new Vector3(0.02, -0.12, 0.42)]);
  const pg = new TubeGeometry(pc, 12, 0.016, 6, false);
  liberables.push(pg);
  const pm = new MeshLambertMaterial({ color: "#9bbf5a", transparent: true });
  const lm = new MeshLambertMaterial({ color: "#f472b6", transparent: true });
  mats.push(pm, lm);
  liberables.push(pm, lm);
  g.add(new Mesh(pg, pm));
  const lobe = new SphereGeometry(0.035, 8, 6);
  liberables.push(lobe);
  for (let i = 0; i < 3; i++) {
    const l = new Mesh(lobe, lm);
    const a = (i / 3) * Math.PI * 2;
    l.position.set(0.02 + Math.cos(a) * 0.04, -0.12 + Math.sin(a) * 0.04, 0.44);
    g.add(l);
  }
  return g;
}

/* ───────── le personnage ───────── */

export function creerPersonnage(id: IdPerso): Personnage {
  const s = STYLES[id];
  const liberables: { dispose: () => void }[] = [];
  const mats: MeshLambertMaterial[] = [];
  const m = (color: string) => {
    const x = new MeshLambertMaterial({ color, transparent: true });
    mats.push(x);
    liberables.push(x);
    return x;
  };
  const geo = <T extends { dispose: () => void }>(g: T) => {
    liberables.push(g);
    return g;
  };

  const racine = new Group();
  const corps = new Group();
  racine.add(corps);

  const mHaut = m(s.haut);
  const mHaut2 = m(s.haut2);
  const mBas = m(s.bas);
  const mMain = m(PEAU);
  const mChaus = m(s.chaussures);
  const mTige = m(TIGE);
  const mOr = m("#d99a00");

  // torse
  const torse = new Mesh(geo(new CapsuleGeometry(0.4, 0.55, 6, 18)), mHaut);
  torse.scale.set(1, 1, 0.74);
  torse.position.y = 1.6;
  corps.add(torse);
  // détail de la tenue
  if (id === "recruteur" || id === "divine") {
    // revers de veste, chemise ou haut dessous
    const chemise = new Mesh(geo(new BoxGeometry(0.2, 0.62, 0.02)), mHaut2);
    chemise.position.set(0, 1.62, 0.31);
    corps.add(chemise);
    for (let k = 0; k < 2; k++) {
      const b = new Mesh(geo(new SphereGeometry(0.035, 8, 6)), id === "divine" ? mOr : mOr);
      b.position.set(0, 1.5 - k * 0.2, 0.33);
      corps.add(b);
    }
  }
  if (id === "curieuse") {
    // salopette : bretelles et poche
    [-0.16, 0.16].forEach((x) => {
      const br = new Mesh(geo(new BoxGeometry(0.07, 0.6, 0.02)), mHaut2);
      br.position.set(x, 1.7, 0.31);
      corps.add(br);
    });
    const poche = new Mesh(geo(new BoxGeometry(0.26, 0.2, 0.02)), mHaut2);
    poche.position.set(0, 1.4, 0.32);
    corps.add(poche);
  }
  if (id === "etudiante") {
    // sac à dos
    const sac = new Mesh(geo(new BoxGeometry(0.62, 0.8, 0.28)), m("#2b2b2b"));
    sac.position.set(0, 1.6, -0.34);
    corps.add(sac);
    const poche = new Mesh(geo(new BoxGeometry(0.4, 0.28, 0.06)), mOr);
    poche.position.set(0, 1.4, -0.5);
    corps.add(poche);
  }
  if (id === "client") {
    const bande = new Mesh(geo(new BoxGeometry(0.1, 0.9, 0.02)), mHaut2);
    bande.position.set(0, 1.6, 0.3);
    corps.add(bande);
  }
  // le cou : une tige verte
  const cou = new Mesh(geo(new CylinderGeometry(0.09, 0.11, 0.42, 14)), mTige);
  cou.position.y = 2.18;
  corps.add(cou);
  if (id === "divine") {
    const collier = new Mesh(geo(new TorusGeometry(0.15, 0.018, 8, 24)), mOr);
    collier.rotation.x = Math.PI / 2;
    collier.position.y = 2.04;
    corps.add(collier);
  }

  // la tête (pivot au sommet du cou)
  const tete = new Group();
  tete.position.set(0, 2.62, 0);
  const fleur = s.fleur === "lys" ? teteLys(s, mats, liberables) : teteTournesol(s, mats, liberables);
  fleur.position.y = 0.34;
  tete.add(fleur);
  if (id === "curieuse") {
    // lunettes rondes posées sur le cœur de la fleur
    [-0.2, 0.2].forEach((x) => {
      const l = new Mesh(geo(new TorusGeometry(0.15, 0.022, 8, 24)), m("#2b2b2b"));
      l.position.set(x, 0.38, 0.2);
      tete.add(l);
    });
    const pont = new Mesh(geo(new BoxGeometry(0.1, 0.02, 0.02)), m("#2b2b2b"));
    pont.position.set(0, 0.4, 0.2);
    tete.add(pont);
  }
  if (id === "etudiante") {
    // casque autour du cou
    const arceau = new Mesh(geo(new TorusGeometry(0.2, 0.035, 8, 24, Math.PI)), m("#2b2b2b"));
    arceau.rotation.x = Math.PI;
    arceau.position.set(0, -0.14, 0.04);
    tete.add(arceau);
    [-0.2, 0.2].forEach((x) => {
      const o = new Mesh(geo(new CylinderGeometry(0.07, 0.07, 0.07, 14)), mOr);
      o.rotation.z = Math.PI / 2;
      o.position.set(x, -0.14, 0.04);
      tete.add(o);
    });
  }
  corps.add(tete);

  // bras : épaule, puis avant-bras qui peut se plier
  const bras = (cote: 1 | -1) => {
    const b = new Group();
    b.position.set(cote * 0.52, 1.98, 0);
    const haut = new Mesh(geo(new CapsuleGeometry(0.115, 0.42, 5, 12)), mHaut);
    haut.position.y = -0.3;
    b.add(haut);
    const av = new Group();
    av.position.y = -0.62;
    const bas = new Mesh(geo(new CapsuleGeometry(0.1, 0.34, 5, 12)), mHaut);
    bas.position.y = -0.24;
    av.add(bas);
    const main = new Mesh(geo(new SphereGeometry(0.115, 12, 10)), mMain);
    main.position.y = -0.5;
    av.add(main);
    b.add(av);
    corps.add(b);
    return { b, av };
  };
  const bG = bras(-1);
  const bD = bras(1);

  // accessoires tenus en main
  if (s.accessoire === "carnet") {
    const c = new Mesh(geo(new BoxGeometry(0.22, 0.3, 0.04)), m("#d99a00"));
    c.position.set(0, -0.52, 0.12);
    bD.av.add(c);
  }
  if (s.accessoire === "tablette") {
    const t = new Mesh(geo(new BoxGeometry(0.34, 0.46, 0.04)), m("#1a1d22"));
    t.position.set(-0.04, -0.5, 0.15);
    bG.av.add(t);
    const e = new Mesh(geo(new BoxGeometry(0.28, 0.4, 0.005)), m("#9ec7ff"));
    e.position.set(-0.04, -0.5, 0.175);
    bG.av.add(e);
  }
  if (s.accessoire === "magazine") {
    const mag = new Mesh(geo(new BoxGeometry(0.34, 0.46, 0.04)), m("#ffffff"));
    mag.position.set(0, -0.5, 0.14);
    bD.av.add(mag);
    const bandeau = new Mesh(geo(new BoxGeometry(0.34, 0.12, 0.045)), mOr);
    bandeau.position.set(0, -0.36, 0.14);
    bD.av.add(bandeau);
  }

  // jambes : cuisse puis mollet (genou), chaussures
  const jambe = (cote: 1 | -1) => {
    const j = new Group();
    j.position.set(cote * 0.2, 1.06, 0);
    const cuisse = new Mesh(geo(new CapsuleGeometry(0.15, 0.4, 5, 12)), mBas);
    cuisse.position.y = -0.3;
    j.add(cuisse);
    const mollet = new Group();
    mollet.position.y = -0.55;
    const bas = new Mesh(geo(new CapsuleGeometry(0.13, 0.36, 5, 12)), mBas);
    bas.position.y = -0.26;
    mollet.add(bas);
    const chaus = new Mesh(geo(new SphereGeometry(1, 14, 10)), mChaus);
    chaus.scale.set(0.17, 0.11, 0.28);
    chaus.position.set(0, -0.52, 0.09);
    mollet.add(chaus);
    j.add(mollet);
    racine.add(j);
    return { j, mollet };
  };
  const jG = jambe(-1);
  const jD = jambe(1);

  const asseoir = (assis: boolean) => {
    if (assis) {
      jG.j.rotation.x = -Math.PI / 2;
      jD.j.rotation.x = -Math.PI / 2;
      jG.mollet.rotation.x = Math.PI / 2;
      jD.mollet.rotation.x = Math.PI / 2;
    } else {
      jG.j.rotation.x = jD.j.rotation.x = 0;
      jG.mollet.rotation.x = jD.mollet.rotation.x = 0;
    }
  };

  return {
    racine,
    corps,
    tete,
    brasG: bG.b,
    brasD: bD.b,
    avantBrasD: bD.av,
    jambeG: jG.j,
    jambeD: jD.j,
    molletG: jG.mollet,
    molletD: jD.mollet,
    matieres: mats,
    asseoir,
    liberer: () => liberables.forEach((o) => o.dispose()),
  };
}

export type { Material };
export { DEG };
