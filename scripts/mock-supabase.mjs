#!/usr/bin/env node
/**
 * Un faux Supabase pour les tests (jamais utilisé en production) : un vrai Postgres en mémoire (PGlite) avec schema.sql et
 * seed.sql, derrière une toute petite imitation de l'API REST (PostgREST).
 *   node scripts/mock-supabase.mjs [port]     puis   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
 * Clés : « anon-test » (public) et « admin-test » (administratrice). POST /__sql exécute du SQL (réservé aux tests).
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

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const envoie = (code, corps) => {
    res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" });
    res.end(corps === undefined ? "" : JSON.stringify(corps));
  };
  if (req.method === "OPTIONS") return envoie(204);
  let corps = "";
  for await (const c of req) corps += c;
  try {
    if (url.pathname === "/__sql") {
      const r = await enFile(() => db.query(corps));
      return envoie(200, r.rows);
    }
    const m = url.pathname.match(/^\/rest\/v1\/(\w+)$/);
    if (!m || !TABLES.has(m[1])) return envoie(404, { message: "inconnu" });
    const table = m[1];
    const cle = (req.headers.apikey ?? "").toString();
    const bearer = (req.headers.authorization ?? "").toString().replace(/^Bearer /, "");
    const admin = bearer === "admin-test" || cle === "admin-test";
    const role = admin ? "authenticated" : "anon";
    const email = admin ? "graouroudivine@gmail.com" : "";
    if (req.method === "GET") {
      const ordre = url.searchParams.get("order");
      const o = ordre && /^\w+\.(asc|desc)$/.test(ordre) ? ` order by ${ordre.split(".")[0]} ${ordre.split(".")[1]}` : "";
      const rows = await sous(role, email, async () => (await db.query(`select * from public.${table}${o}`)).rows);
      return envoie(200, rows);
    }
    if (req.method === "POST") {
      const d = JSON.parse(corps);
      const cols = Object.keys(d);
      const vals = cols.map((c) => d[c]);
      await sous(role, email, () => db.query(`insert into public.${table} (${cols.map((c) => `"${c}"`).join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")})`, vals));
      return envoie(201);
    }
    return envoie(405, { message: "non pris en charge" });
  } catch (e) {
    return envoie(400, { message: String(e.message ?? e) });
  }
}).listen(port, () => console.log(`faux Supabase sur http://localhost:${port}`));
