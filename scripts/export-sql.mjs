#!/usr/bin/env node
/**
 * Génère supabase/seed.sql à partir du contenu actuel du site (dossier /content).
 *   node scripts/export-sql.mjs
 * Le seed ne remplace jamais ce qui existe déjà (on conflict do nothing) : on peut le relancer sans écraser les modifications.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const racine = path.resolve(import.meta.dirname, "..");
const charge = async (nom) => import(pathToFileURL(path.join(racine, "content", `${nom}.ts`)).href);

const { identite } = await charge("identite");
const { edito } = await charge("edito");
const { parcours } = await charge("parcours");
const { experiences } = await charge("experience");
const { projets } = await charge("projets");
const { competences, atouts } = await charge("competences");
const { recette } = await charge("recette");
const { questions } = await charge("interview");
const { peintureIntro, tableaux } = await charge("peinture");

/* ───────── petits outils d'écriture SQL ───────── */
const q = (v) => `'${String(v ?? "").replaceAll("'", "''")}'`;
const arr = (a) => (a && a.length ? `array[${a.map(q).join(", ")}]::text[]` : "'{}'::text[]");
const json = (o) => `${q(JSON.stringify(o ?? null))}::jsonb`;
const bool = (b) => (b ? "true" : "false");
const num = (n) => String(Number(n));
const slug = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

const lignes = [];
const ecrire = (s = "") => lignes.push(s);
const insere = (table, colonnes, rows, conflit = "id") => {
  if (!rows.length) return;
  ecrire(`insert into public.${table} (${colonnes.join(", ")}) values`);
  ecrire(rows.map((r) => `  (${r.join(", ")})`).join(",\n"));
  ecrire(`on conflict (${conflit}) do nothing;`);
  ecrire();
};

ecrire("-- ============================================================================");
ecrire("--  [div_dev_Now] — données actuelles du site (généré par scripts/export-sql.mjs)");
ecrire("--  À exécuter après schema.sql. Ne remplace jamais une ligne déjà présente.");
ecrire("-- ============================================================================");
ecrire();

/* identité */
insere(
  "identite",
  ["id", "prenom", "nom", "magazine", "titre", "accroches", "passions", "ville", "email", "telephone", "afficher_telephone", "github", "instagram", "whatsapp", "linkedin", "cv_url", "portrait_url", "numero", "langues", "centres_interet"],
  [
    [
      "1",
      q(identite.prenom),
      q(identite.nom),
      q(identite.magazine),
      q(identite.titre),
      arr(identite.accroches),
      arr(identite.passions),
      q(identite.ville),
      q(identite.email),
      q(identite.telephone),
      bool(identite.afficherTelephone),
      q(identite.github),
      q(identite.instagram),
      q(identite.whatsapp),
      q(identite.linkedin),
      q(identite.cv),
      q(identite.portrait),
      q(identite.numero),
      json(identite.langues),
      arr(identite.centresInteret),
    ],
  ],
);

/* édito */
insere("edito", ["id", "titre", "texte", "signature"], [["1", q(edito.titre), q(edito.texte), q(edito.signature)]]);

/* réglages */
insere(
  "reglages",
  ["cle", "valeur"],
  [
    [q("peinture.titre"), q(peintureIntro.titre)],
    [q("peinture.chapo"), q(peintureIntro.chapo)],
  ],
  "cle",
);

/* parcours */
insere(
  "parcours",
  ["id", "position", "periode", "titre", "lieu", "detail", "branche"],
  parcours.map((p, i) => [q(slug(p.titre)), num(i + 1), q(p.periode), q(p.titre), q(p.lieu), q(p.detail ?? ""), bool(p.branche)]),
);

/* expériences */
insere(
  "experiences",
  ["id", "position", "periode", "poste", "entreprise", "lieu", "resume", "missions", "lien_texte", "lien_href", "fond", "accent", "logo_url", "monogramme"],
  experiences.map((e, i) => [q(e.id), num(i + 1), q(e.periode), q(e.poste), q(e.entreprise), q(e.lieu), q(e.resume), arr(e.missions), q(e.lien?.texte), q(e.lien?.href), q(e.fond), q(e.accent), q(e.logo), q(e.monogramme)]),
);

/* projets */
insere(
  "projets",
  ["slug", "position", "publie", "titre", "taille_titre", "rubrique", "chapo", "description", "stack", "fonctionnalites", "date_projet", "role", "equipe", "statut", "lien", "format", "captures", "couverture"],
  projets.map((p, i) => [
    q(p.slug),
    num(i + 1),
    "true",
    q(p.titre),
    q(p.tailleTitre),
    q(p.rubrique),
    q(p.chapo),
    q(p.description),
    arr(p.stack),
    arr(p.fonctionnalites),
    q(p.date),
    q(p.role),
    q(p.equipe),
    q(p.statut),
    q(p.lien),
    q(p.format ?? "web"),
    arr(p.captures),
    json(p.couverture),
  ]),
  "slug",
);

/* boîte à outils */
insere(
  "competences",
  ["id", "position", "categorie", "items"],
  competences.map((c, i) => [q(slug(c.categorie)), num(i + 1), q(c.categorie), arr([...c.items])]),
);
insere(
  "atouts",
  ["id", "position", "texte"],
  atouts.map((t, i) => [q(`atout-${i + 1}`), num(i + 1), q(t)]),
);

/* recette */
insere(
  "recette",
  ["id", "titre", "sous_titre", "intro", "temps", "difficulte", "pour", "ingredients"],
  [["1", q(recette.titre), q(recette.sousTitre), q(recette.intro), q(recette.temps), q(recette.difficulte), q(recette.pour), arr(recette.ingredients)]],
);
insere(
  "recette_etapes",
  ["id", "position", "nom", "texte"],
  recette.etapes.map((e, i) => [q(`etape-${i + 1}`), num(i + 1), q(e.nom), q(e.texte)]),
);

/* interview */
ecrire("insert into public.interview (id, position, question, reponse) overriding system value values");
ecrire(questions.map((x, i) => `  (${x.id}, ${i + 1}, ${q(x.question)}, ${q(x.reponse ?? "")})`).join(",\n"));
ecrire("on conflict (id) do nothing;");
ecrire("select setval(pg_get_serial_sequence('public.interview', 'id'), (select coalesce(max(id), 1) from public.interview));");
ecrire();

/* médiathèque : les images actuelles du site (chemins locaux ; scripts/televerser-images.mjs les envoie dans le stockage) */
const medias = [];
const vus = new Set();
const ajouteMedia = (url, dossier, alt, type = "image") => {
  if (!url || vus.has(url)) return;
  vus.add(url);
  medias.push({ id: `media-${slug(path.basename(url, path.extname(url)))}`, nom: path.basename(url), dossier, url, alt, type });
};
ajouteMedia(identite.portrait, "portrait", "Portrait de Divine Graourou");
ajouteMedia(identite.cv, "cv", "CV de Divine Graourou", "fichier");
experiences.forEach((e) => ajouteMedia(e.logo, "logos", `Logo : ${e.entreprise}`));
projets.forEach((p) => (p.captures ?? []).forEach((c, i) => ajouteMedia(c, "projets", `${p.titre}, capture ${i + 1}`)));
tableaux.forEach((t) => ajouteMedia(t.image, "tableaux", t.titre ?? ""));
// seuls les fichiers qui existent vraiment dans /public sont enregistrés
const { existsSync } = await import("node:fs");
const presents = medias.filter((m) => existsSync(path.join(racine, "public", m.url)));
insere(
  "medias",
  ["id", "nom", "dossier", "url", "alt", "type"],
  presents.map((m) => [q(m.id), q(m.nom), q(m.dossier), q(m.url), q(m.alt), q(m.type)]),
);

/* peinture */
insere(
  "tableaux",
  ["id", "position", "titre", "annee", "technique", "dimensions", "image_url", "ratio"],
  tableaux.map((t, i) => [q(t.id), num(i + 1), q(t.titre), q(t.annee), q(t.technique), q(t.dimensions), q(t.image), num(t.ratio.toFixed(4))]),
);

mkdirSync(path.join(racine, "supabase"), { recursive: true });
writeFileSync(path.join(racine, "supabase", "seed.sql"), lignes.join("\n"), "utf8");
console.log(`supabase/seed.sql écrit (${lignes.length} lignes)`);
