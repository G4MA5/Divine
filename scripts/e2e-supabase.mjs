#!/usr/bin/env node
/**
 * Test de bout en bout du branchement Supabase, sans internet ni compte :
 *   1. démarre un faux Supabase (vrai Postgres en mémoire + schema.sql + seed.sql) ;
 *   2. construit le site pointé dessus et le démarre ;
 *   3. vérifie que le site affiche les données de la base, qu'une modification + /api/revalidate la met à jour,
 *      et qu'un message de contact arrive bien dans la table `messages`.
 *   node scripts/e2e-supabase.mjs
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const racine = path.resolve(import.meta.dirname, "..");
const PORT_BDD = 54399;
const PORT_SITE = 3399;
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: `http://localhost:${PORT_BDD}`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-test",
  REVALIDATE_SECRET: "secret-e2e",
  NEXT_DIST_DIR: ".next-e2e",
};
const enfants = [];
const arret = () => enfants.forEach((e) => e.kill());
process.on("exit", arret);
let echecs = 0;
const verifie = (ok, texte) => {
  console.log(`${ok ? "  ok " : "  ÉCHEC"} ${texte}`);
  if (!ok) echecs++;
};
const attendre = async (f, delai = 30000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < delai) {
    try {
      if (await f()) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
};
const sql = (requete) => fetch(`http://localhost:${PORT_BDD}/__sql`, { method: "POST", body: requete }).then((r) => r.json());

const bdd = spawn(process.execPath, ["scripts/mock-supabase.mjs", String(PORT_BDD)], { cwd: racine, env, stdio: "ignore" });
enfants.push(bdd);
verifie(await attendre(() => fetch(`http://localhost:${PORT_BDD}/rest/v1/projets`).then((r) => r.ok)), "le faux Supabase démarre avec le schéma et les données");

console.log("  … construction du site (1 à 2 minutes)");
const build = spawnSync("npx", ["next", "build"], { cwd: racine, env, shell: true, stdio: "ignore" });
verifie(build.status === 0, "le site se construit en lisant la base");

const site = spawn("npx", ["next", "start", "-p", String(PORT_SITE)], { cwd: racine, env, shell: true, stdio: "ignore" });
enfants.push(site);
const url = `http://localhost:${PORT_SITE}`;
verifie(await attendre(() => fetch(url).then((r) => r.ok)), "le site démarre");

const html = await (await fetch(url)).text();
verifie(html.includes("Prochain numéro") || html.includes("Divine"), "l'accueil affiche le contenu venu de la base");
const metro = await (await fetch(`${url}/reportages/metro`)).text();
verifie(metro.includes("Metro"), "la page d'un projet de la base existe");

await sql("update projets set titre = 'Metro Deux', chapo = 'Chapo modifie ASCII' where slug = 'metro'");
await sql("update edito set signature = 'Zoe-test'");
const mauvais = await fetch(`${url}/api/revalidate`, { method: "POST", headers: { "x-revalidate-secret": "faux" } });
verifie(mauvais.status === 401, "/api/revalidate refuse un mauvais secret");
const bon = await fetch(`${url}/api/revalidate`, { method: "POST", headers: { "x-revalidate-secret": "secret-e2e" } });
verifie(bon.status === 200, "/api/revalidate accepte le bon secret");
verifie(await attendre(async () => (await (await fetch(`${url}/reportages/metro`)).text()).includes("Chapo modifie ASCII"), 20000), "la modification d'un projet apparaît sur le site");
verifie(await attendre(async () => (await (await fetch(url)).text()).includes("Zoe-test"), 20000), "la modification de l'édito apparaît sur l'accueil");

const envoi = await fetch(`http://localhost:${PORT_BDD}/rest/v1/messages`, {
  method: "POST",
  headers: { apikey: "anon-test", "Content-Type": "application/json", Prefer: "return=minimal" },
  body: JSON.stringify({ nom: "Test", email: "test@exemple.com", sujet: "Sujet", message: "Bonjour" }),
});
verifie(envoi.status === 201, "un message de contact est enregistré");
verifie((await sql("select count(*)::int as n from messages where email = 'test@exemple.com'"))[0].n === 1, "le message est bien dans la table");

arret();
console.log(echecs ? `\n${echecs} vérification(s) en échec` : "\nLe site et la base fonctionnent ensemble.");
process.exit(echecs ? 1 : 0);
