-- ============================================================================
--  [div_dev_Now] — schéma Supabase du portfolio
--  À exécuter UNE FOIS dans Supabase > SQL Editor (puis exécuter seed.sql).
--  Le script peut être relancé sans danger : il ne supprime jamais de données.
--
--  Principe de sécurité :
--    • tout le monde peut LIRE le contenu publié (le site utilise la clé « anon ») ;
--    • seule une personne connectée dont l'e-mail est dans la table `admins` peut MODIFIER ;
--    • les visiteurs peuvent seulement ÉCRIRE un message de contact (jamais le lire).
-- ============================================================================

-- ───────────────────────── administrateurs ─────────────────────────
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- aucune policy : personne ne peut lire ni modifier cette table depuis l'API.

insert into public.admins (email) values ('graouroudivine@gmail.com') on conflict do nothing;

-- Vrai si la personne connectée est administratrice (utilisée par les policies ci-dessous).
create or replace function public.est_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────── identité (une seule ligne) ─────────────────────────
create table if not exists public.identite (
  id int primary key default 1 check (id = 1),
  prenom text not null,
  nom text not null,
  magazine text not null default '[div_dev_Now]',
  titre text not null default '',
  accroches text[] not null default '{}',
  passions text[] not null default '{}',
  ville text not null default '',
  email text not null default '',
  telephone text not null default '',
  afficher_telephone boolean not null default false,
  github text not null default '',
  instagram text not null default '',
  whatsapp text not null default '',
  linkedin text not null default '',
  cv_url text not null default '',
  portrait_url text not null default '',
  numero text not null default 'N° 01',
  langues jsonb not null default '[]'::jsonb,
  centres_interet text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- ───────────────────────── édito (une seule ligne) ─────────────────────────
create table if not exists public.edito (
  id int primary key default 1 check (id = 1),
  titre text not null default 'Édito',
  texte text not null default '',
  signature text not null default '',
  updated_at timestamptz not null default now()
);

-- ───────────────────────── réglages (petits textes libres) ─────────────────────────
create table if not exists public.reglages (
  cle text primary key,
  valeur text not null default '',
  updated_at timestamptz not null default now()
);

-- ───────────────────────── parcours ─────────────────────────
create table if not exists public.parcours (
  id text primary key default gen_random_uuid()::text,
  position int not null default 0,
  periode text not null default '',
  titre text not null,
  lieu text not null default '',
  detail text not null default '',
  -- une étape « en branche » (ex. un certificat) part de l'étape précédente et revient avant la suivante
  branche boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ───────────────────────── expériences ─────────────────────────
create table if not exists public.experiences (
  id text primary key default gen_random_uuid()::text,
  position int not null default 0,
  periode text not null default '',
  poste text not null,
  entreprise text not null default '',
  lieu text not null default '',
  resume text not null default '',
  missions text[] not null default '{}',
  lien_texte text not null default '',
  lien_href text not null default '',
  fond text not null default '#fdf1c9',
  accent text not null default '#d99a00',
  logo_url text not null default '',
  monogramme text not null default '',
  updated_at timestamptz not null default now()
);

-- ───────────────────────── projets ─────────────────────────
create table if not exists public.projets (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position int not null default 0,
  publie boolean not null default true,
  titre text not null,
  taille_titre text not null default '12cqw',
  rubrique text not null default '',
  chapo text not null default '',
  description text not null default '',
  stack text[] not null default '{}',
  fonctionnalites text[] not null default '{}',
  date_projet text not null default '',
  role text not null default '',
  equipe text not null default '',
  statut text not null default '',
  lien text not null default '',
  format text not null default 'web' check (format in ('web', 'mobile')),
  captures text[] not null default '{}',
  -- la couverture du dossier : {theme, disposition, chevauche, grand[], petit[], credit, art}
  couverture jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ───────────────────────── boîte à outils ─────────────────────────
create table if not exists public.competences (
  id text primary key default gen_random_uuid()::text,
  position int not null default 0,
  categorie text not null,
  items text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.atouts (
  id text primary key default gen_random_uuid()::text,
  position int not null default 0,
  texte text not null,
  updated_at timestamptz not null default now()
);

-- ───────────────────────── la recette ─────────────────────────
create table if not exists public.recette (
  id int primary key default 1 check (id = 1),
  titre text not null default 'La Recette',
  sous_titre text not null default '',
  intro text not null default '',
  temps text not null default '',
  difficulte text not null default '',
  pour text not null default '',
  ingredients text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.recette_etapes (
  id text primary key default gen_random_uuid()::text,
  position int not null default 0,
  nom text not null,
  texte text not null default '',
  updated_at timestamptz not null default now()
);

-- ───────────────────────── interview ─────────────────────────
create table if not exists public.interview (
  id int primary key generated by default as identity,
  position int not null default 0,
  question text not null,
  reponse text not null default '',
  updated_at timestamptz not null default now()
);

-- ───────────────────────── peinture ─────────────────────────
create table if not exists public.tableaux (
  id text primary key default gen_random_uuid()::text,
  position int not null default 0,
  titre text not null default '',
  annee text not null default '',
  technique text not null default '',
  dimensions text not null default '',
  image_url text not null default '',
  ratio numeric not null default 1 check (ratio > 0.2 and ratio < 5),
  updated_at timestamptz not null default now()
);

-- ───────────────────────── messages de contact ─────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom text not null check (char_length(nom) between 1 and 120),
  email text not null check (char_length(email) between 5 and 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  sujet text not null default '' check (char_length(sujet) <= 300),
  message text not null check (char_length(message) between 1 and 5000),
  lu boolean not null default false,
  archive boolean not null default false
);

-- ───────────────────────── mises à jour automatiques de updated_at ─────────────────────────
do $$
declare t text;
begin
  foreach t in array array['identite','edito','reglages','parcours','experiences','projets','competences','atouts','recette','recette_etapes','interview','tableaux']
  loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ───────────────────────── sécurité (RLS) ─────────────────────────
do $$
declare t text;
begin
  foreach t in array array['identite','edito','reglages','parcours','experiences','competences','atouts','recette','recette_etapes','interview','tableaux']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists lecture_publique on public.%I', t);
    execute format('create policy lecture_publique on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists ecriture_admin on public.%I', t);
    execute format('create policy ecriture_admin on public.%I for all to authenticated using (public.est_admin()) with check (public.est_admin())', t);
  end loop;
end $$;

-- projets : le public ne voit que les projets publiés
alter table public.projets enable row level security;
drop policy if exists lecture_publique on public.projets;
create policy lecture_publique on public.projets for select to anon, authenticated using (publie or public.est_admin());
drop policy if exists ecriture_admin on public.projets;
create policy ecriture_admin on public.projets for all to authenticated using (public.est_admin()) with check (public.est_admin());

-- messages : les visiteurs écrivent, seule l'administratrice lit et trie
alter table public.messages enable row level security;
drop policy if exists envoi_public on public.messages;
create policy envoi_public on public.messages for insert to anon, authenticated with check (lu = false and archive = false);
drop policy if exists gestion_admin on public.messages;
create policy gestion_admin on public.messages for all to authenticated using (public.est_admin()) with check (public.est_admin());

-- ───────────────────────── stockage des images ─────────────────────────
-- Un seul « bucket » public en lecture : logos, tableaux, captures de projets, portrait, CV.
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict (id) do nothing;

drop policy if exists "portfolio lecture publique" on storage.objects;
create policy "portfolio lecture publique" on storage.objects for select using (bucket_id = 'portfolio');

drop policy if exists "portfolio ecriture admin" on storage.objects;
create policy "portfolio ecriture admin" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio' and public.est_admin());

drop policy if exists "portfolio modification admin" on storage.objects;
create policy "portfolio modification admin" on storage.objects for update to authenticated using (bucket_id = 'portfolio' and public.est_admin());

drop policy if exists "portfolio suppression admin" on storage.objects;
create policy "portfolio suppression admin" on storage.objects for delete to authenticated using (bucket_id = 'portfolio' and public.est_admin());
