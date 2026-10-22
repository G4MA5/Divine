# Base de données du portfolio (Supabase)

| Fichier | Rôle |
| --- | --- |
| `schema.sql` | les tables, la sécurité (RLS), le stockage des images. À exécuter **une fois**. |
| `seed.sql` | toutes les données actuelles du site (généré par `npm run db:seed` depuis le dossier `content/`). |

Les deux fichiers se relancent sans danger : rien n'est jamais supprimé ni écrasé.

## Mise en place
1. Supabase → **SQL Editor** → colle `schema.sql` → **Run**, puis `seed.sql` → **Run**.
2. **Authentication → Users → Add user** : ton compte (e-mail + mot de passe). L'e-mail doit figurer dans la table `admins`
   (`graouroudivine@gmail.com` par défaut ; pour en ajouter un autre : `insert into public.admins (email) values ('...');`).
3. **Authentication → Sign In / Providers** : désactive « Allow new users to sign up ».
4. Variables d'environnement du site (voir `.env.example`) : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`.
5. L'application de commande (dépôt `app-de-control-portfolio`) fait le reste.

## Tables
| Table | Contenu | Lecture publique |
| --- | --- | --- |
| `identite`, `edito`, `recette` | une seule ligne (`id = 1`) | oui |
| `reglages` | petits textes (titre et phrase de la galerie de peinture) | oui |
| `parcours`, `experiences`, `competences`, `atouts`, `recette_etapes`, `interview`, `tableaux` | listes ordonnées (`position`) | oui |
| `projets` | un projet par ligne (`slug`), avec `publie` | seulement si `publie = true` |
| `messages` | messages du formulaire de contact | **non** : les visiteurs ne peuvent qu'écrire |
| `admins` | e-mails autorisés à modifier | non |

Stockage : le seau public `portfolio` (logos, tableaux, captures, portrait, CV). Lecture pour tous, écriture pour les admins.

## Comment le site lit la base
- `lib/contenu.ts` lit les tables avec la clé publique et assemble un objet `Contenu`. Si Supabase n'est pas configuré,
  ne répond pas, ou si une liste est vide, le contenu du dossier `content/` est utilisé : le site s'affiche toujours.
- `lib/contenu-serveur.ts` met ce contenu en cache (environ une minute).
- `POST /api/revalidate` avec l'en-tête `x-revalidate-secret` rafraîchit tout de suite (c'est ce qu'appelle l'application).

## Vérifications
```bash
npm run db:verify       # exécute schema.sql + seed.sql dans un vrai Postgres en mémoire et teste les règles de sécurité
npm run test:supabase   # construit le site contre un faux Supabase et vérifie lecture, mise à jour et messages de contact
```
