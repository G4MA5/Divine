/** « Au clair de la lune » : les notes sont des hauteurs (Hz), les durées sont en temps (noire = 1). */
const SOL4 = 392;
const LA4 = 440;
const SI4 = 493.88;
const DO5 = 523.25;
const RE5 = 587.33;
const MI5 = 659.25;
const LA5 = 880;

export type Note = { f: number; temps: number };

const phraseA: Note[] = [
  { f: DO5, temps: 1 },
  { f: DO5, temps: 1 },
  { f: DO5, temps: 1 },
  { f: RE5, temps: 1 },
  { f: MI5, temps: 2 },
  { f: RE5, temps: 2 },
  { f: DO5, temps: 1 },
  { f: MI5, temps: 1 },
  { f: RE5, temps: 1 },
  { f: RE5, temps: 1 },
  { f: DO5, temps: 4 },
];

const phraseC: Note[] = [
  { f: RE5, temps: 1 },
  { f: RE5, temps: 1 },
  { f: RE5, temps: 1 },
  { f: RE5, temps: 1 },
  { f: LA5, temps: 2 },
  { f: LA5, temps: 2 },
  { f: RE5, temps: 1 },
  { f: DO5, temps: 1 },
  { f: SI4, temps: 1 },
  { f: LA4, temps: 1 },
  { f: SOL4, temps: 4 },
];

export const CLAIR_DE_LUNE: Note[] = [...phraseA, ...phraseC, ...phraseA];

/** Les sept hauteurs différentes, de la plus grave à la plus aiguë : chacune a toujours le même tournesol. */
export const HAUTEURS = [SOL4, LA4, SI4, DO5, RE5, MI5, LA5];
export const TEMPO = 104; // noires par minute
