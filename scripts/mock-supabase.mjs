#!/usr/bin/env node
/**
 * Un faux Supabase pour les tests (jamais utilisé en production) : un vrai Postgres en mémoire (PGlite) avec schema.sql et
 * seed.sql, derrière une imitation de l'API REST (PostgREST), de l'authentification et du stockage.
 *   node scripts/mock-supabase.mjs [port]     puis   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
 * Clés : « anon-test » (public). Connexion administratrice : graouroudivine@gmail.com / admin-pass (jeton « admin-test »).
 * POST /__sql exécute du SQL (réservé aux tests). Les règles de sécurité (RLS) sont celles de schema.sql.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "..", "supabase");
const port = Number(process.argv[2] ?? 54321);
const db = new PGlite();
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid default gen_random_uuid() primary key, bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public, storage to anon, authenticated;
`);
await db.exec(readFileSync(path.join(dir, "schema.sql"), "utf8"));
await db.exec("grant all on all tables in schema public to anon, authenticated;");
await db.exec(readFileSync(path.join(dir, "seed.sql"), "utf8"));

const TABLES = new Set(["identite", "edito", "reglages", "parcours", "experiences", "projets", "competences", "atouts", "recette", "recette_etapes", "interview", "tableaux", "messages"]);
const COLONNES_JSON = new Set(["langues", "couverture"]);
const ADMIN_EMAIL = "graouroudivine@gmail.com";
const ADMIN_MDP = "admin-pass";
const fichiers = new Map(); // stockage en mémoire

// une seule requête à la fois (PGlite n'a qu'une connexion)
let file = Promise.resolve();
const enFile = (f) => (file = file.then(f, f));
const sous = (role, email, f) =>
  enFile(async () => {
    await db.exec(`set role ${role}; select set_config('request.jwt.claims', '${email ? JSON.stringify({ email }) : ""}', false);`);
    try {
      return await f();
    } finally {
      await db.exec("reset role;");
    }
  });

const ident = (s) => {
  if (!/^\w+$/.test(s)) throw new Error(`identifiant invalide : ${s}`);
  return `"${s}"`;
};

/** Une valeur JSON de l'API → paramètre SQL (les colonnes jsonb reçoivent du texte JSON, les autres tableaux restent des tableaux). */
const param = (cle, v) => (COLONNES_JSON.has(cle) && v !== null ? JSON.stringify(v) : v);

/** Les filtres PostgREST (colonne=eq.valeur) → clause where paramétrée. */
function filtres(params) {
  const clauses = [];
  const valeurs = [];
  for (const [cle, v] of params) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(cle)) continue;
    const m = v.match(/^(eq|neq|is)\.(.*)$/);
    if (!m) throw new Error(`filtre non pris en charge : ${cle}=${v}`);
    if (m[1] === "is") clauses.push(`${ident(cle)} is ${m[2]}`);
    else {
      valeurs.push(m[2]);
      clauses.push(`${ident(cle)}::text ${m[1] === "eq" ? "=" : "<>"} $${valeurs.length}`);
    }
  }
  return { where: clauses.length ? ` where ${clauses.join(" and ")}` : "", valeurs };
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const envoie = (code, corps, type = "application/json") => {
    res.writeHead(code, { "Content-Type": type, "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Expose-Headers": "*" });
    res.end(corps === undefined ? "" : type === "application/json" ? JSON.stringify(corps) : corps);
  };
  if (req.method === "OPTIONS") return envoie(204);
  const morceaux = [];
  for await (const c of req) morceaux.push(c);
  const brut = Buffer.concat(morceaux);
  const corps = brut.toString("utf8");
  if (process.env.MOCK_DEBUG) console.log(req.method, req.url, "| prefer:", req.headers.prefer, "| auth:", String(req.headers.authorization).slice(0, 24), "|", corps.slice(0, 120));
  try {
    if (url.pathname === "/__sql") {
      const r = await enFile(() => db.query(corps));
      return envoie(200, r.rows);
    }

    /* ───── authentification ───── */
    if (url.pathname === "/auth/v1/token" && req.method === "POST") {
      const d = JSON.parse(corps || "{}");
      if (d.email?.toLowerCase() === ADMIN_EMAIL && d.password === ADMIN_MDP) {
        const user = { id: "00000000-0000-0000-0000-000000000001", aud: "authenticated", role: "authenticated", email: ADMIN_EMAIL, app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
        return envoie(200, { access_token: "admin-test", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "refresh-test", user });
      }
      return envoie(400, { error: "invalid_grant", error_description: "Invalid login credentials", code: "invalid_credentials" });
    }
    if (url.pathname === "/auth/v1/logout") return envoie(204);

    /* ───── stockage ───── */
    const st = url.pathname.match(/^\/storage\/v1\/object\/(?:public\/)?([\w-]+)\/(.+)$/);
    if (st) {
      const [, seau, chemin] = st;
      if (req.method === "GET") {
        const f = fichiers.get(`${seau}/${chemin}`);
        return f ? envoie(200, f, "application/octet-stream") : envoie(404, { message: "absent" });
      }
      const bearer = (req.headers.authorization ?? "").toString().replace(/^Bearer /, "");
      if (bearer !== "admin-test") return envoie(403, { message: "new row violates row-level security policy", statusCode: "403" });
      fichiers.set(`${seau}/${chemin}`, brut);
      return envoie(200, { Key: `${seau}/${chemin}`, Id: "obj" });
    }

    /* ───── tables (PostgREST) ───── */
    const m = url.pathname.match(/^\/rest\/v1\/(\w+)$/);
    if (!m || !TABLES.has(m[1])) return envoie(404, { message: "inconnu" });
    const table = ident(m[1]);
    const bearer = (req.headers.authorization ?? "").toString().replace(/^Bearer /, "");
    const admin = bearer === "admin-test" || (req.headers.apikey ?? "").toString() === "admin-test";
    const role = admin ? "authenticated" : "anon";
    const email = admin ? ADMIN_EMAIL : "";
    const prefer = (req.headers.prefer ?? "").toString();
    const veutRetour = prefer.includes("return=representation");
    const unSeul = (req.headers.accept ?? "").toString().includes("vnd.pgrst.object");
    const rend = (rows, code = 200) => {
      if (unSeul) {
        if (rows.length !== 1) return envoie(406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" });
        return envoie(code, rows[0]);
      }
      return envoie(code, rows);
    };
    const { where, valeurs } = filtres(url.searchParams);

    if (req.method === "GET") {
      const ordre = url.searchParams.get("order");
      const o = ordre && /^\w+\.(asc|desc)$/.test(ordre) ? ` order by ${ident(ordre.split(".")[0])} ${ordre.split(".")[1]}` : "";
      const rows = await sous(role, email, async () => (await db.query(`select * from public.${table}${where}${o}`, valeurs)).rows);
      return rend(rows);
    }

    if (req.method === "POST") {
      const d = JSON.parse(corps);
      const lignes = Array.isArray(d) ? d : [d];
      const cles = Object.keys(lignes[0] ?? {});
      const surConflit = url.searchParams.get("on_conflict");
      const fusion = prefer.includes("resolution=merge-duplicates");
      const rows = await sous(role, email, async () => {
        const sorties = [];
        for (const l of lignes) {
          const vals = cles.map((c) => param(c, l[c]));
          const maj = fusion && surConflit ? ` on conflict (${surConflit.split(",").map(ident).join(", ")}) do update set ${cles.map((c) => `${ident(c)} = excluded.${ident(c)}`).join(", ")}` : "";
          const r = await db.query(`insert into public.${table} (${cles.map(ident).join(", ")}) values (${cles.map((_, i) => `$${i + 1}`).join(", ")})${maj}${veutRetour ? " returning *" : ""}`, vals);
          sorties.push(...r.rows);
        }
        return sorties;
      });
      return veutRetour ? rend(rows, 201) : envoie(201);
    }

    if (req.method === "PATCH") {
      const d = JSON.parse(corps);
      const cles = Object.keys(d);
      const vals = cles.map((c) => param(c, d[c]));
      const decal = valeurs.length;
      const rows = await sous(role, email, async () =>
        (await db.query(`update public.${table} set ${cles.map((c, i) => `${ident(c)} = $${decal + i + 1}`).join(", ")}${where}${veutRetour ? " returning *" : ""}`, [...valeurs, ...vals])).rows,
      );
      return veutRetour ? rend(rows) : envoie(204);
    }

    if (req.method === "DELETE") {
      const rows = await sous(role, email, async () => (await db.query(`delete from public.${table}${where}${veutRetour ? " returning *" : ""}`, valeurs)).rows);
      return veutRetour ? rend(rows) : envoie(204);
    }
    return envoie(405, { message: "non pris en charge" });
  } catch (e) {
    const msg = String(e.message ?? e);
    const code = /row-level security|permission denied/.test(msg) ? 403 : 400;
    return envoie(code, { code: code === 403 ? "42501" : "XX000", message: msg });
  }
}).listen(port, () => console.log(`faux Supabase sur http://localhost:${port}`));
