import { CanvasTexture, SRGBColorSpace, RepeatWrapping, LinearMipmapLinearFilter, LinearFilter } from "three";
import type { Identite } from "@/lib/contenu";
import { rubriques, pad, pageLabel } from "@/content/sections";

/**
 * Les faces du magazine 3D sont dessinées dans des canvas 2D (mêmes mises en page que la couverture et les pages en CSS),
 * puis posées comme textures. Toutes les dimensions sont en « cqw » (1 % de la largeur), comme dans la version CSS.
 */
export type Variante = "sommaire" | "fin";

const INK = "#121212";
const OR = "#f2b400";
const ACCENT = "#b87f00";

/** La vraie police (next/font) : le nom de famille est dans la variable CSS posée sur <html>. */
const famille = (variable: string, secours: string) => {
  if (typeof document === "undefined") return secours;
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v || secours;
};

const charger = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

type Opt = { font: string; size: number; color?: string; align?: CanvasTextAlign; spacing?: number; stroke?: { w: number; color: string }; maxWidth?: number };

function texte(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: Opt) {
  ctx.save();
  ctx.font = o.font.replace("{s}", `${o.size}px`);
  ctx.textAlign = o.align ?? "left";
  ctx.textBaseline = "alphabetic";
  (ctx as unknown as { letterSpacing: string }).letterSpacing = `${o.spacing ?? 0}px`;
  if (o.stroke) {
    ctx.lineJoin = "round";
    ctx.lineWidth = o.stroke.w;
    ctx.strokeStyle = o.stroke.color;
    ctx.strokeText(s, x, y, o.maxWidth);
  }
  ctx.fillStyle = o.color ?? INK;
  ctx.fillText(s, x, y, o.maxWidth);
  ctx.restore();
}

function etoile(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, couleur: string) {
  const s = w / 40;
  ctx.save();
  ctx.translate(cx - w / 2, cy - w / 2);
  ctx.scale(s, s);
  ctx.fillStyle = couleur;
  ctx.fill(new Path2D("M20 0c1.5 11 8.5 18.5 20 20-11.5 1.5-18.5 9-20 20-1.5-11-8.5-18.5-20-20C11.5 18.5 18.5 11 20 0Z"));
  ctx.restore();
}

function creerCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

const versTexture = (c: HTMLCanvasElement, aniso = 8) => {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = aniso;
  t.minFilter = LinearMipmapLinearFilter;
  t.magFilter = LinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
};

/** La couverture (page de droite fermée). */
async function dessinerCouverture(identite: Identite, nbProjets: number, portrait: string | null, edition: string, cvDispo: boolean) {
  const W = 1000;
  const H = (W * 4) / 3;
  const u = W / 100;
  const c = creerCanvas(W, H);
  const ctx = c.getContext("2d")!;
  const display = famille("--font-playfair", "serif");
  const sans = famille("--font-inter", "sans-serif");
  const serif = famille("--font-cormorant", "serif");
  const dFont = `italic 900 {s} ${display}`;
  const dBold = `900 {s} ${display}`;
  const dBoldItalic = `italic 700 {s} ${display}`;
  const sFont = `700 {s} ${sans}`;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // le soleil derrière la tête
  const cx = W / 2;
  const cy = (34 + 39) * u;
  const r = 39 * u;
  ctx.fillStyle = OR;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "#f7c93a";
  for (let a = 0; a < 360; a += 15) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, ((a - 90) * Math.PI) / 180, ((a + 6 - 90) * Math.PI) / 180);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // en-tête
  texte(ctx, `${identite.numero} — ${edition}`.toUpperCase(), 6 * u, 7.4 * u, { font: sFont, size: 2 * u, spacing: 0.4 * u });
  texte(ctx, "LE MAGAZINE DE DIVINE", W - 6 * u, 7.4 * u, { font: sFont, size: 2 * u, spacing: 0.4 * u, align: "right" });

  // le titre, derrière le portrait
  texte(ctx, identite.magazine, cx, 12 * u + 12.2 * u * 0.82, { font: dFont, size: 12.2 * u, align: "center", spacing: -0.5 * u });

  // le portrait (posé en bas, contenu dans 58 × 116 cqw)
  const bx = cx - 29 * u;
  const bw = 58 * u;
  const bh = 116 * u;
  if (portrait) {
    const img = await charger(portrait);
    if (img) {
      const k = Math.min(bw / img.width, bh / img.height);
      const w = img.width * k;
      const h = img.height * k;
      ctx.drawImage(img, bx + (bw - w) / 2, H - h, w, h);
    } else portraitDeSecours(ctx, cx, H, u);
  } else portraitDeSecours(ctx, cx, H, u);

  // étoiles
  etoile(ctx, 9 * u + 3.5 * u, 34 * u + 3.5 * u, 7 * u, OR);
  etoile(ctx, W - 9 * u - 3 * u, 52 * u + 3 * u, 6 * u, INK);
  etoile(ctx, 14 * u + 2.5 * u, 96 * u + 2.5 * u, 5 * u, INK);

  // accroches (filet au-dessus, majuscules espacées)
  const sticker = (s: string, x: number, y: number, droite = false) => {
    const fs = 2.2 * u;
    ctx.save();
    ctx.fillStyle = INK;
    const w = Math.min(27 * u, ctx.measureText(s).width + 8 * u);
    ctx.fillRect(droite ? x - Math.max(w, 20 * u) : x, y, Math.max(w, 20 * u), 0.3 * u);
    ctx.restore();
    texte(ctx, s.toUpperCase(), x, y + 1.1 * u + fs * 1.05, { font: sFont, size: fs, spacing: 0.3 * u, align: droite ? "right" : "left", maxWidth: 27 * u });
  };
  sticker(identite.accroches[0], 5 * u, 46 * u);
  sticker(identite.accroches[1], 7 * u, 62 * u);
  sticker(identite.accroches[2], 5 * u, 76 * u);
  sticker(`${nbProjets} projets à la une`, W - 5 * u, 54 * u, true);
  sticker("L'interview exclusive", W - 6 * u, 72 * u, true);

  // le nom, qui chevauche la photo
  texte(ctx, "GRAOUROU", cx, H - 16 * u - 6.8 * u * 0.95, { font: dBold, size: 12.5 * u, align: "center", spacing: -0.25 * u, stroke: { w: 1.8 * u, color: "#ffffff" } });
  texte(ctx, "Olivier Grace Divine", cx, H - 16 * u, { font: dBoldItalic, size: 6.8 * u, align: "center", color: ACCENT, stroke: { w: 1.4 * u, color: "#ffffff" } });

  // code-barres
  const bw2 = 19 * u;
  const bx2 = W - 5.5 * u - bw2;
  const by2 = H - 5.5 * u - (bw2 * 34) / 70;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(bx2, by2, bw2, (bw2 * 34) / 70);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.3 * u;
  ctx.strokeRect(bx2, by2, bw2, (bw2 * 34) / 70);
  const k = bw2 / 70;
  let x = 0;
  ctx.fillStyle = INK;
  [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 3].forEach((w, i) => {
    const px = 3 + x;
    x += w + 1.2;
    if (i % 2 === 0) ctx.fillRect(bx2 + px * k, by2 + 3 * k, w * k, 24 * k);
  });
  texte(ctx, cvDispo ? "TÉLÉCHARGER LE CV" : "0 01 2026 CV", bx2 + bw2 / 2, by2 + 32 * k, { font: `400 {s} monospace`, size: 3.6 * k, align: "center" });

  // ville
  texte(ctx, identite.ville.toUpperCase(), 6 * u, H - 6.2 * u, { font: sFont, size: 2 * u, spacing: 0.4 * u });

  // cadre intérieur
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.55 * u;
  ctx.strokeRect(2.6 * u, 2.6 * u, W - 5.2 * u, H - 5.2 * u);

  void serif;
  return c;
}

function portraitDeSecours(ctx: CanvasRenderingContext2D, cx: number, H: number, u: number) {
  const s = (58 * u) / 400;
  ctx.save();
  ctx.translate(cx - 200 * s, H - 520 * s);
  ctx.scale(s, s);
  ctx.fillStyle = INK;
  ctx.fill(new Path2D("M0 520c8-110 60-150 130-168l50-14h40l50 14c70 18 122 58 130 168Z"));
  ctx.beginPath();
  ctx.roundRect(168, 262, 64, 80, 28);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(200, 190, 78, 96, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Page de gauche (dos de la couverture) : « Sommaire » ou « Merci ». */
function dessinerPageGauche(identite: Identite, variante: Variante) {
  const W = 1000;
  const H = (W * 4) / 3;
  const u = W / 100;
  const c = creerCanvas(W, H);
  const ctx = c.getContext("2d")!;
  const display = famille("--font-playfair", "serif");
  const sans = famille("--font-inter", "sans-serif");
  const serif = famille("--font-cormorant", "serif");
  const fin = variante === "fin";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  texte(ctx, identite.magazine.toUpperCase(), 7 * u, 7 * u + 2.2 * u, { font: `400 {s} ${sans}`, size: 2.2 * u, color: "rgba(18,18,18,.6)", spacing: 0.6 * u });
  const gros = fin ? 13 * u : 16 * u;
  texte(ctx, fin ? "Merci" : "Sommaire", 7 * u, 7 * u + 14 * u + gros * 0.85, { font: `italic 900 {s} ${display}`, size: gros, color: ACCENT });
  ctx.fillStyle = OR;
  ctx.fillRect(7 * u, 7 * u + 14 * u + gros + 6 * u, W - 14 * u, 0.25 * u);
  const phrase = fin ? ["Merci de votre lecture.", "À très bientôt."] : ["Des reportages, une interview", "et quelques surprises."];
  phrase.forEach((l, i) => texte(ctx, l, 7 * u, 7 * u + 14 * u + gros + 6 * u + 4 * u + 4 * u * 1.1 + i * 5 * u, { font: `italic 400 {s} ${serif}`, size: 4.2 * u, color: "rgba(18,18,18,.75)" }));
  texte(ctx, `P. ${pad(fin ? 23 : 2)}`, 7 * u, H - 4 * u, { font: `400 {s} ${sans}`, size: 2 * u, color: "rgba(18,18,18,.5)", spacing: 0.4 * u });
  return c;
}

/** Page de droite : le sommaire détaillé, ou « À suivre ». */
function dessinerPageDroite(identite: Identite, variante: Variante) {
  const W = 1000;
  const H = (W * 4) / 3;
  const u = W / 100;
  const c = creerCanvas(W, H);
  const ctx = c.getContext("2d")!;
  const display = famille("--font-playfair", "serif");
  const sans = famille("--font-inter", "sans-serif");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  if (variante === "fin") {
    texte(ctx, "À SUIVRE", W / 2, 38 * u, { font: `400 {s} ${sans}`, size: 2.2 * u, color: "rgba(18,18,18,.6)", spacing: 0.6 * u, align: "center" });
    texte(ctx, "Prochain numéro", W / 2, 38 * u + 5 * u + 12 * u, { font: `italic 900 {s} ${display}`, size: 12 * u, color: ACCENT, align: "center", maxWidth: 86 * u });
    ctx.fillStyle = OR;
    ctx.fillRect(W / 2 - 10 * u, 38 * u + 5 * u + 12 * u + 6 * u, 20 * u, 0.25 * u);
    texte(ctx, identite.email, W / 2, 38 * u + 5 * u + 12 * u + 6 * u + 4 * u + 4.4 * u, { font: `italic 400 {s} ${display}`, size: 4.4 * u, color: "rgba(18,18,18,.7)", align: "center" });
    return c;
  }
  texte(ctx, "CE QU'IL Y A DANS CE NUMÉRO", 7 * u, 7 * u + 2.2 * u, { font: `400 {s} ${sans}`, size: 2.2 * u, color: "rgba(18,18,18,.6)", spacing: 0.6 * u });
  rubriques.slice(1, 8).forEach((r, i) => {
    const y = 7 * u + 6 * u + 1.5 * u + i * (4.6 * u + 3 * u) + 4.6 * u;
    const titre = r.titre;
    texte(ctx, titre, 7 * u, y, { font: `italic 400 {s} ${display}`, size: 4.6 * u });
    const num = pageLabel(r);
    ctx.font = `italic 400 ${4.6 * u}px ${display}`;
    const tw = ctx.measureText(titre).width;
    ctx.save();
    ctx.setLineDash([0.4 * u, 0.9 * u]);
    ctx.strokeStyle = OR;
    ctx.lineWidth = 0.35 * u;
    ctx.beginPath();
    ctx.moveTo(7 * u + tw + 2 * u, y - 0.4 * u);
    ctx.lineTo(W - 7 * u - 8 * u, y - 0.4 * u);
    ctx.stroke();
    ctx.restore();
    texte(ctx, num, W - 7 * u, y, { font: `400 {s} ${sans}`, size: 2.4 * u, color: "rgba(18,18,18,.6)", align: "right" });
  });
  texte(ctx, `${identite.magazine.toUpperCase()} — P. 03`, W - 7 * u, H - 4 * u, { font: `400 {s} ${sans}`, size: 2 * u, color: "rgba(18,18,18,.5)", spacing: 0.4 * u, align: "right" });
  return c;
}

/** Tranche de papier : fines lignes de feuilles. `sens` choisit la direction des lignes selon la face. */
function dessinerPapier(sens: "u" | "v") {
  const c = creerCanvas(64, 64);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f4f2ec";
  ctx.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 64; i += 2) {
    ctx.fillStyle = i % 4 === 0 ? "#e4e0d4" : "#ece9df";
    if (sens === "u") ctx.fillRect(i, 0, 1, 64);
    else ctx.fillRect(0, i, 64, 1);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

export type JeuTextures = {
  couverture: CanvasTexture;
  gauche: CanvasTexture;
  droite: CanvasTexture;
  papierU: CanvasTexture;
  papierV: CanvasTexture;
};

export async function creerTextures(variante: Variante, o: { portrait: string | null; cvDispo: boolean; identite: Identite; nbProjets: number }): Promise<JeuTextures> {
  // les polices du site doivent être prêtes avant de dessiner
  try {
    await Promise.all([
      document.fonts.load("italic 900 40px " + famille("--font-playfair", "serif")),
      document.fonts.load("700 40px " + famille("--font-playfair", "serif")),
      document.fonts.load("italic 700 40px " + famille("--font-playfair", "serif")),
      document.fonts.load("700 20px " + famille("--font-inter", "sans-serif")),
      document.fonts.load("400 20px " + famille("--font-inter", "sans-serif")),
      document.fonts.load("italic 400 20px " + famille("--font-cormorant", "serif")),
    ]);
  } catch {
    /* on dessine quand même avec les polices de secours */
  }
  const s = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const edition = s.charAt(0).toUpperCase() + s.slice(1);
  const couv = await dessinerCouverture(o.identite, o.nbProjets, o.portrait, edition, o.cvDispo);
  return {
    couverture: versTexture(couv),
    gauche: versTexture(dessinerPageGauche(o.identite, variante)),
    droite: versTexture(dessinerPageDroite(o.identite, variante)),
    papierU: dessinerPapier("u"),
    papierV: dessinerPapier("v"),
  };
}
