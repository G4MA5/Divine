import { identite as identiteLocale } from "@/content/identite";
import { edito as editoLocal } from "@/content/edito";
import { parcours as parcoursLocal, type EtapeParcours } from "@/content/parcours";
import { experiences as experiencesLocales, type Experience } from "@/content/experience";
import { projets as projetsLocaux, type Projet } from "@/content/projets";
import { competences as competencesLocales, atouts as atoutsLocaux } from "@/content/competences";
import { recette as recetteLocale } from "@/content/recette";
import { questions as questionsLocales, type QuestionInterview } from "@/content/interview";
import { peintureIntro as peintureIntroLocale, tableaux as tableauxLocaux, type Tableau } from "@/content/peinture";

/**
 * Tout le contenu du site, dans un seul objet. Il vient de Supabase quand les variables d'environnement sont renseignées
 * (NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY), et du dossier /content sinon, ou si Supabase ne répond pas.
 * Le site reste donc toujours affichable, même hors ligne.
 */
export type Identite = {
  prenom: string;
  nom: string;
  magazine: string;
  titre: string;
  accroches: string[];
  passions: string[];
  ville: string;
  email: string;
  telephone: string;
  afficherTelephone: boolean;
  github: string;
  instagram: string;
  whatsapp: string;
  linkedin: string;
  cv: string;
  portrait: string;
  numero: string;
  langues: { langue: string; niveau: string }[];
  centresInteret: string[];
};
export type Edito = { titre: string; texte: string; signature: string };
export type FamilleOutils = { categorie: string; items: string[] };
export type Recette = {
  titre: string;
  sousTitre: string;
  intro: string;
  temps?: string;
  difficulte?: string;
  pour: string;
  ingredients: string[];
  etapes: { nom: string; texte: string }[];
};

export type Contenu = {
  identite: Identite;
  edito: Edito;
  parcours: EtapeParcours[];
  experiences: Experience[];
  projets: Projet[];
  competences: FamilleOutils[];
  atouts: string[];
  recette: Recette;
  interview: QuestionInterview[];
  peinture: { titre: string; chapo: string; tableaux: Tableau[] };
};

export type { EtapeParcours, Experience, Projet, QuestionInterview, Tableau };

/** Le contenu du dossier /content (valeurs d'origine, et solution de repli). */
export const contenuLocal: Contenu = {
  identite: { ...identiteLocale, accroches: [...identiteLocale.accroches], passions: [...identiteLocale.passions], langues: identiteLocale.langues.map((l) => ({ ...l })), centresInteret: [...identiteLocale.centresInteret] },
  edito: { ...editoLocal },
  parcours: parcoursLocal,
  experiences: experiencesLocales,
  projets: projetsLocaux,
  competences: competencesLocales.map((c) => ({ categorie: c.categorie, items: [...c.items] })),
  atouts: [...atoutsLocaux],
  recette: recetteLocale,
  interview: questionsLocales,
  peinture: { titre: peintureIntroLocale.titre, chapo: peintureIntroLocale.chapo, tableaux: tableauxLocaux },
};

/* ───────── lecture de Supabase ───────── */

const URL_SUPABASE = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const CLE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseConfigure = () => !!URL_SUPABASE && !!CLE_ANON;

type Ligne = Record<string, unknown>;

async function lire(table: string, ordre = "position.asc"): Promise<Ligne[] | null> {
  try {
    const r = await fetch(`${URL_SUPABASE}/rest/v1/${table}?select=*${ordre ? `&order=${ordre}` : ""}`, {
      headers: { apikey: CLE_ANON, Authorization: `Bearer ${CLE_ANON}`, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const rows = (await r.json()) as Ligne[];
    return Array.isArray(rows) ? rows : null;
  } catch (e) {
    console.warn(`[contenu] lecture de « ${table} » impossible, contenu local utilisé :`, e instanceof Error ? e.message : e);
    return null;
  }
}

const s = (v: unknown, defaut = "") => (typeof v === "string" ? v : v == null ? defaut : String(v));
const tab = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : []);
/** une chaîne vide devient « non renseigné » : le site masque alors le champ */
const opt = (v: unknown) => {
  const x = s(v).trim();
  return x ? x : undefined;
};

const versIdentite = (r: Ligne): Identite => ({
  prenom: s(r.prenom),
  nom: s(r.nom),
  magazine: s(r.magazine, "[div_dev_Now]"),
  titre: s(r.titre),
  accroches: tab(r.accroches),
  passions: tab(r.passions),
  ville: s(r.ville),
  email: s(r.email),
  telephone: s(r.telephone),
  afficherTelephone: r.afficher_telephone === true,
  github: s(r.github),
  instagram: s(r.instagram),
  whatsapp: s(r.whatsapp),
  linkedin: s(r.linkedin),
  cv: s(r.cv_url),
  portrait: s(r.portrait_url),
  numero: s(r.numero, "N° 01"),
  langues: Array.isArray(r.langues) ? (r.langues as { langue?: unknown; niveau?: unknown }[]).map((l) => ({ langue: s(l.langue), niveau: s(l.niveau) })) : [],
  centresInteret: tab(r.centres_interet),
});

const versProjet = (r: Ligne): Projet => ({
  slug: s(r.slug),
  titre: s(r.titre),
  tailleTitre: s(r.taille_titre, "12cqw"),
  rubrique: s(r.rubrique),
  chapo: s(r.chapo),
  description: s(r.description),
  stack: tab(r.stack),
  fonctionnalites: tab(r.fonctionnalites),
  date: opt(r.date_projet),
  role: opt(r.role),
  equipe: opt(r.equipe),
  statut: opt(r.statut),
  lien: opt(r.lien),
  format: r.format === "mobile" ? "mobile" : "web",
  captures: tab(r.captures),
  couverture: (r.couverture && typeof r.couverture === "object" ? r.couverture : {}) as Projet["couverture"],
});

const versExperience = (r: Ligne): Experience => ({
  id: s(r.id),
  periode: opt(r.periode),
  poste: s(r.poste),
  entreprise: s(r.entreprise),
  lieu: opt(r.lieu),
  resume: opt(r.resume),
  missions: tab(r.missions),
  fond: s(r.fond, "#fdf1c9"),
  accent: s(r.accent, "#d99a00"),
  logo: opt(r.logo_url),
  monogramme: s(r.monogramme),
  lien: opt(r.lien_href) ? { texte: s(r.lien_texte) || s(r.lien_href), href: s(r.lien_href) } : undefined,
});

/** Ne garde le résultat de Supabase que s'il contient au moins une ligne ; sinon, le contenu local. */
const liste = <T,>(rows: Ligne[] | null, f: (r: Ligne) => T, local: T[]): T[] => (rows && rows.length ? rows.map(f) : local);

export async function chargerContenu(): Promise<Contenu> {
  if (!supabaseConfigure()) return contenuLocal;

  const [id, ed, reg, par, exp, pro, com, ato, rec, etp, itw, tab_] = await Promise.all([
    lire("identite", ""),
    lire("edito", ""),
    lire("reglages", ""),
    lire("parcours"),
    lire("experiences"),
    lire("projets"),
    lire("competences"),
    lire("atouts"),
    lire("recette", ""),
    lire("recette_etapes"),
    lire("interview"),
    lire("tableaux"),
  ]);

  const L = contenuLocal;
  const reglage = (cle: string, defaut: string) => {
    const x = reg?.find((r) => r.cle === cle);
    return x ? s(x.valeur) : defaut;
  };
  const r0 = rec?.[0];
  const etapes = liste(etp, (r) => ({ nom: s(r.nom), texte: s(r.texte) }), L.recette.etapes);

  return {
    identite: id?.[0] ? versIdentite(id[0]) : L.identite,
    edito: ed?.[0] ? { titre: s(ed[0].titre, "Édito"), texte: s(ed[0].texte), signature: s(ed[0].signature) } : L.edito,
    parcours: liste(par, (r) => ({ periode: s(r.periode), titre: s(r.titre), lieu: s(r.lieu), detail: opt(r.detail), branche: r.branche === true }), L.parcours),
    experiences: liste(exp, versExperience, L.experiences),
    projets: liste(pro, versProjet, L.projets),
    competences: liste(com, (r) => ({ categorie: s(r.categorie), items: tab(r.items) }), L.competences),
    atouts: liste(ato, (r) => s(r.texte), L.atouts),
    recette: r0
      ? { titre: s(r0.titre, "La Recette"), sousTitre: s(r0.sous_titre), intro: s(r0.intro), temps: opt(r0.temps), difficulte: opt(r0.difficulte), pour: s(r0.pour), ingredients: tab(r0.ingredients), etapes }
      : { ...L.recette, etapes },
    interview: liste(itw, (r) => ({ id: Number(r.id), question: s(r.question), reponse: opt(r.reponse) }), L.interview),
    peinture: {
      titre: reglage("peinture.titre", L.peinture.titre),
      chapo: reglage("peinture.chapo", L.peinture.chapo),
      tableaux: liste(
        tab_,
        (r) => ({ id: s(r.id), titre: opt(r.titre), annee: opt(r.annee), technique: opt(r.technique), dimensions: opt(r.dimensions), image: opt(r.image_url), ratio: Number(r.ratio) > 0 ? Number(r.ratio) : 1 }),
        L.peinture.tableaux,
      ),
    },
  };
}
