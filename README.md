# [div_dev_Now] — le portfolio magazine de Divine

Un portfolio raconté comme un magazine : une couverture 3D, un livre qui s'ouvre sur une table, des personnages à tête de
fleur, des reportages (projets), une interview, une galerie de peinture, et des tournesols qui chantent en bas de page.

**Technologies** : Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind 4 · GSAP + ScrollTrigger · Lenis ·
three.js (React Three Fiber) · Web Audio / Howler · Supabase (contenu) · Playwright (tests).

## Démarrer
Node.js ≥ 20.9 (voir `.nvmrc`).
```bash
npm ci                    # installe exactement les versions du fichier package-lock.json
npm run dev               # http://localhost:3000
npm run build && npm start
```
Le site fonctionne sans configuration : il affiche le contenu du dossier `content/`. Les polices sont hébergées dans le
projet (`app/fonts/`) : la construction n'a besoin d'aucun accès à Google Fonts.

## Le contenu vient de Supabase
Copier `.env.example` en `.env.local` et renseigner :

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la base (clé publique « anon » uniquement). Sans elles : contenu du dossier `content/` |
| `REVALIDATE_SECRET` | autorise l'application de commande à rafraîchir le site tout de suite (`POST /api/revalidate`) |
| `NEXT_PUBLIC_SITE_URL` | adresse publique (plan du site, aperçus de partage, balises canoniques) |
| `NEXT_PUBLIC_FORM_ENDPOINT` | facultatif : service de formulaire, utilisé seulement sans Supabase |

La base se prépare avec `supabase/schema.sql` puis `supabase/seed.sql` (voir `supabase/README.md`). Le contenu se modifie
ensuite depuis l'application mobile `app-de-control-portfolio`. Les messages du formulaire de contact arrivent dans la table
`messages`, lisible seulement par l'administratrice.

Sans Supabase, tout le texte se trouve dans `content/` (jamais dans les composants) ; `npm run db:seed` régénère `seed.sql`
à partir de ces fichiers.

## Tests
```bash
npm run lint
npx tsc --noEmit
npm run build
npx playwright test         # 390 px et 1280 px, mouvement réduit, clavier, URLs directes, scènes 3D, contact…
npm run db:verify           # schema.sql + seed.sql dans un vrai Postgres en mémoire, avec les règles de sécurité
npm run test:supabase       # le site contre un faux Supabase : lecture, mise à jour, revalidation, messages
```
Pour construire sans toucher au dossier `.next` d'un serveur de développement : `NEXT_DIST_DIR=.next-build npm run build`.

## Structure
```
app/            pages (accueil, reportages/[slug]), API /api/revalidate, polices
components/     rubriques/ (les pages du magazine), scene3d/ (livre, table, personnages, salon d'interview),
                reactbits/ (composants de reactbits.dev adaptés), ui/, intro/
content/        les textes d'origine (repli quand Supabase est absent)
lib/            contenu.ts (lecture de Supabase), son, scènes GSAP
supabase/       schema.sql, seed.sql
scripts/        export-sql.mjs, verifier-sql.mjs, mock-supabase.mjs, e2e-supabase.mjs
tests/          Playwright
```

## Réglages utiles
- Avatar ou son : `components/scene3d/Personnage.ts` (personnages 3D), `lib/sound.ts` (sons synthétisés ; un vrai fichier
  déposé dans `public/sounds/` prend le pas).
- Images des projets : dans l'application (stockage Supabase) ou dans `public/images/` avec `captures` dans `content/projets.ts`.
- `TODO-CONTENU.md` liste ce qui reste à renseigner.

## Règles du projet
Fond blanc fixe (pas de mode sombre), une seule couleur d'accent (le tournesol), son coupé par défaut, mouvement réduit
respecté, bouton « Passer l'intro » toujours visible pendant l'intro, tout le site en français, personnages sans genre.
