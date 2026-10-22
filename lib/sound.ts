/**
 * Ambiance sonore. Coupée par défaut : rien ne se lance sans action explicite du visiteur.
 *
 * Tant que les vrais fichiers ne sont pas fournis (/public/sounds/*.mp3, voir TODO-CONTENU.md),
 * chaque son est synthétisé avec la Web Audio API pour que tout soit testable.
 * Pour utiliser un vrai fichier : renseigner son nom dans FILES, il prendra le pas sur la synthèse (Howler).
 */

export type SoundName =
  | "clic" // clic de stylo
  | "machine" // frappe de machine à écrire
  | "papier" // froissement de papier
  | "tic" // petit tic
  | "page" // page qu'on tourne
  | "fermer" // page qui se ferme
  | "pop" // raquette
  | "woosh" // souffle
  | "tampon" // tampon « Validé »
  | "gresillement" // grésillement de cuisine
  | "vinyle" // grain de vinyle (boucle très douce)
  | "bonjour"; // petit accord d'ouverture

/** Nom de fichier optionnel par son, dans /public/sounds/ */
const FILES: Partial<Record<SoundName, string>> = {};

let enabled = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const loops = new Map<SoundName, { stop: () => void }>();

const VOLUME = 0.35;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function isEnabled() {
  return enabled;
}

export function setEnabled(on: boolean) {
  enabled = on;
  if (on) {
    const c = getCtx();
    if (c && c.state === "suspended") void c.resume();
    play("bonjour");
  } else {
    stopAllLoops();
  }
}

export function suspend() {
  if (ctx && ctx.state === "running") void ctx.suspend();
}

export function resume() {
  if (enabled && ctx && ctx.state === "suspended") void ctx.resume();
}

function stopAllLoops() {
  loops.forEach((l) => l.stop());
  loops.clear();
}

/* ───────── petits outils de synthèse ───────── */

function noiseBuffer(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(c: AudioContext, freq: number, t: number, dur: number, peak = 0.3, type: OscillatorType = "sine", slideTo?: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  env(g, t, peak, 0.005, dur);
  o.connect(g).connect(master!);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function burst(c: AudioContext, t: number, dur: number, peak: number, filter: { type: BiquadFilterType; freq: number; q?: number; to?: number }) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur + 0.1);
  const f = c.createBiquadFilter();
  f.type = filter.type;
  f.frequency.setValueAtTime(filter.freq, t);
  if (filter.to) f.frequency.exponentialRampToValueAtTime(filter.to, t + dur);
  f.Q.value = filter.q ?? 1;
  const g = c.createGain();
  env(g, t, peak, 0.004, dur);
  src.connect(f).connect(g).connect(master!);
  src.start(t);
  src.stop(t + dur + 0.1);
}

const synth: Record<Exclude<SoundName, "vinyle">, (c: AudioContext, t: number) => void> = {
  clic: (c, t) => {
    burst(c, t, 0.03, 0.5, { type: "bandpass", freq: 3200, q: 2 });
    tone(c, 1400, t, 0.04, 0.12, "square");
  },
  machine: (c, t) => {
    burst(c, t, 0.025, 0.55, { type: "highpass", freq: 1800 });
    tone(c, 220, t, 0.05, 0.12, "triangle");
  },
  papier: (c, t) => {
    for (let i = 0; i < 5; i++) burst(c, t + i * 0.045, 0.06, 0.28, { type: "bandpass", freq: 2400 + Math.random() * 2500, q: 0.7 });
  },
  tic: (c, t) => {
    tone(c, 1800, t, 0.03, 0.18, "square");
  },
  page: (c, t) => {
    burst(c, t, 0.32, 0.45, { type: "bandpass", freq: 700, to: 3600, q: 0.6 });
    burst(c, t + 0.28, 0.05, 0.3, { type: "highpass", freq: 3000 });
  },
  fermer: (c, t) => {
    burst(c, t, 0.22, 0.4, { type: "bandpass", freq: 3200, to: 500, q: 0.6 });
    tone(c, 110, t + 0.18, 0.12, 0.35, "sine", 60);
  },
  pop: (c, t) => {
    tone(c, 520, t, 0.1, 0.45, "sine", 180);
    burst(c, t, 0.03, 0.25, { type: "bandpass", freq: 1800, q: 1.5 });
  },
  woosh: (c, t) => {
    burst(c, t, 0.35, 0.5, { type: "bandpass", freq: 500, to: 4200, q: 0.8 });
  },
  tampon: (c, t) => {
    tone(c, 90, t, 0.18, 0.7, "sine", 45);
    burst(c, t, 0.06, 0.5, { type: "lowpass", freq: 900 });
  },
  gresillement: (c, t) => {
    for (let i = 0; i < 14; i++) burst(c, t + i * 0.035, 0.03, 0.18, { type: "highpass", freq: 4500 });
  },
  bonjour: (c, t) => {
    [523.25, 659.25, 783.99].forEach((f, i) => tone(c, f, t + i * 0.09, 0.5, 0.16, "sine"));
  },
};

/* ───────── API publique ───────── */

export function play(name: SoundName) {
  if (!enabled) return;
  const file = FILES[name];
  if (file) {
    import("howler").then(({ Howl }) => new Howl({ src: [`/sounds/${file}`], volume: VOLUME }).play());
    return;
  }
  if (name === "vinyle") return startLoop("vinyle");
  const c = getCtx();
  if (!c || !master) return;
  if (c.state === "suspended") void c.resume();
  synth[name](c, c.currentTime + 0.01);
}

/**
 * Une note de clochette (les tournesols chantent) : un son de carillon, c'est-à-dire un fondamental et des harmoniques
 * non entiers qui s'éteignent à des vitesses différentes. Ne joue rien si le son est coupé.
 */
export function cloche(freq: number, delaiSecondes = 0, force = 1) {
  if (!enabled) return;
  const c = getCtx();
  if (!c || !master) return;
  if (c.state === "suspended") void c.resume();
  const t = c.currentTime + 0.01 + delaiSecondes;
  const partiels: [number, number, number][] = [
    [1, 0.5, 2.4],
    [2.76, 0.22, 1.3],
    [5.4, 0.1, 0.7],
    [8.93, 0.05, 0.4],
  ];
  partiels.forEach(([ratio, amp, dur]) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq * ratio, t);
    env(g, t, amp * 0.5 * force, 0.004, dur);
    o.connect(g).connect(master!);
    o.start(t);
    o.stop(t + dur + 0.05);
  });
}

/** Grain de vinyle : bruit très doux, seulement pendant la rubrique concernée. */
export function startLoop(name: "vinyle") {
  if (!enabled || loops.has(name)) return;
  const c = getCtx();
  if (!c || !master) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 2);
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 2600;
  f.Q.value = 0.4;
  const g = c.createGain();
  g.gain.value = 0.0001;
  g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.8);
  src.connect(f).connect(g).connect(master);
  src.start();
  loops.set(name, {
    stop: () => {
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4);
      src.stop(c.currentTime + 0.5);
    },
  });
}

export function stopLoop(name: "vinyle") {
  loops.get(name)?.stop();
  loops.delete(name);
}
