#!/usr/bin/env node
/**
 * Vérifie schema.sql et seed.sql dans un vrai Postgres (PGlite, en mémoire), avec des doublures minimales des schémas
 * `auth` et `storage` de Supabase. Contrôle aussi les règles de sécurité (public / admin / autre personne connectée).
 *   node scripts/verifier-sql.mjs
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "..", "supabase");
const db = new PGlite();
let echecs = 0;
const verifie = (ok, texte) => {
  console.log(`${ok ? "  ok " : "  ÉCHEC"} ${texte}`);
  if (!ok) echecs++;
};

// doublures de Supabase
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid default gen_random_uuid() primary key, bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public, storage to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
`);

await db.exec(readFileSync(path.join(dir, "schema.sql"), "utf8"));
await db.exec("grant all on all tables in schema public to anon, authenticated;");
await db.exec(readFileSync(path.join(dir, "seed.sql"), "utf8"));
// le schéma et le seed se relancent sans erreur ni doublon
await db.exec(readFileSync(path.join(dir, "schema.sql"), "utf8"));
await db.exec(readFileSync(path.join(dir, "seed.sql"), "utf8"));
verifie(true, "schema.sql et seed.sql s'exécutent, deux fois de suite");

const n = async (t) => Number((await db.query(`select count(*)::int as n from public.${t}`)).rows[0].n);
const attendu = { identite: 1, edito: 1, reglages: 2, parcours: 4, experiences: 4, projets: 6, competences: 8, atouts: 4, recette: 1, recette_etapes: 7, interview: 12, tableaux: 6 };
for (const [t, k] of Object.entries(attendu)) verifie((await n(t)) === k, `${t} : ${await n(t)} ligne(s) (attendu ${k})`);

const sous = async (role, email, sql) => {
  await db.exec(`set role ${role}; select set_config('request.jwt.claims', '${email ? JSON.stringify({ email }) : ""}', false);`);
  try {
    return await db.query(sql);
  } finally {
    await db.exec("reset role;");
  }
};
const echoue = async (role, email, sql) => {
  try {
    const r = await sous(role, email, sql);
    return r.affectedRows === 0 ? "aucune ligne" : null;
  } catch (e) {
    return String(e.message);
  }
};

// lecture publique
verifie((await sous("anon", "", "select count(*)::int as n from public.projets")).rows[0].n === 6, "le public lit les 6 projets");
verifie((await sous("anon", "", "select count(*)::int as n from public.admins")).rows[0].n === 0, "le public ne voit pas la table admins");
verifie((await sous("anon", "", "select count(*)::int as n from public.messages")).rows[0].n === 0, "le public ne lit aucun message");

// écriture : refusée au public et aux autres comptes, permise à l'administratrice
verifie(!!(await echoue("anon", "", "update public.edito set signature = 'pirate'")), "le public ne peut pas modifier l'édito");
verifie(!!(await echoue("authenticated", "autre@exemple.com", "update public.edito set signature = 'pirate'")), "un autre compte ne peut pas modifier l'édito");
verifie(!(await echoue("authenticated", "Graouroudivine@gmail.com", "update public.edito set signature = 'Divine !'")), "l'administratrice modifie l'édito");
verifie((await db.query("select signature from public.edito")).rows[0].signature === "Divine !", "la modification de l'administratrice est bien enregistrée");
verifie((await sous("anon", "", "select signature from public.edito")).rows[0].signature === "Divine !", "le public voit la modification");
await db.exec("update public.edito set signature = 'Divine'");

// projets non publiés : cachés au public
await db.exec("update public.projets set publie = false where slug = 'metro'");
verifie((await sous("anon", "", "select count(*)::int as n from public.projets")).rows[0].n === 5, "un projet non publié disparaît pour le public");
verifie((await sous("authenticated", "graouroudivine@gmail.com", "select count(*)::int as n from public.projets")).rows[0].n === 6, "l'administratrice voit aussi les projets non publiés");
await db.exec("update public.projets set publie = true where slug = 'metro'");

// messages de contact
verifie(!(await echoue("anon", "", "insert into public.messages (nom, email, message) values ('Awa', 'awa@exemple.com', 'Bonjour')")), "un visiteur peut envoyer un message");
verifie(!!(await echoue("anon", "", "insert into public.messages (nom, email, message) values ('Awa', 'pas-un-mail', 'Bonjour')")), "un e-mail invalide est refusé");
verifie(!!(await echoue("anon", "", "insert into public.messages (nom, email, message, lu) values ('Awa', 'awa@exemple.com', 'Bonjour', true)")), "un visiteur ne peut pas se déclarer « lu »");
verifie((await sous("authenticated", "graouroudivine@gmail.com", "select count(*)::int as n from public.messages")).rows[0].n === 1, "l'administratrice lit le message");
verifie((await sous("authenticated", "autre@exemple.com", "select count(*)::int as n from public.messages")).rows[0].n === 0, "un autre compte ne lit pas les messages");

// nouvelle ligne d'interview : la séquence est bien repartie après le seed
await db.exec("insert into public.interview (question) values ('Une question de plus ?')");
verifie((await n("interview")) === 13, "une nouvelle question d'interview s'ajoute sans conflit d'identifiant");

console.log(echecs ? `\n${echecs} vérification(s) en échec` : "\nToutes les vérifications SQL passent.");
process.exit(echecs ? 1 : 0);
