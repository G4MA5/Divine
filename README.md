# [div_dev_Now] — le portfolio magazine de Divine

Next.js (App Router) + TypeScript + Tailwind + GSAP/ScrollTrigger + Lenis + Howler.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Variables d'environnement (Vercel)
| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | adresse publique avec le nom de domaine (sitemap, cartes d'aperçu, balises canoniques) |
| `NEXT_PUBLIC_FORM_ENDPOINT` | adresse du formulaire (Formspree ou route Resend). Sans elle, le formulaire ouvre un `mailto:` |

## Tests
```bash
npm run build
npx playwright test     # 390 px et 1280 px, clair / sombre, mouvement réduit, clavier, URLs directes
```

## Modifier le contenu
Tous les textes sont dans `/content` — jamais dans les composants :

| Fichier | Contenu |
|---|---|
| `identite.ts` | nom, titre, contact, langues, centres d'intérêt, chemin du portrait et du CV |
| `parcours.ts` | formation |
| `experience.ts` | expériences pro |
| `projets.ts` | les reportages (un objet par projet) |
| `competences.ts` | compétences et atouts |
| `edito.ts`, `recette.ts`, `interview.ts` | les textes à fournir |
| `sections.ts` | les rubriques, leur numéro de page, le sommaire |
| `avatars.ts` | les 4 avatars du visiteur |

Tout ce qui reste à fournir est listé dans `TODO-CONTENU.md`.

## Ajouter un projet
Ajouter un objet dans `content/projets.ts` (slug unique). Choisir une valeur de `ouverture` parmi
`rendez-vous`, `badge`, `livres`, `stock`, `ticket`, `metro`.

## Remplacer un avatar ou un son
- Avatar : voir `RIVE-SPEC.md`.
- Son : déposer le fichier dans `public/sounds/` et renseigner son nom dans `FILES` de `lib/sound.ts`.
  Sans fichier, le son est synthétisé par le navigateur (Web Audio).

## Règles du projet
Mobile d'abord, mode clair/sombre, son coupé par défaut, mouvement réduit respecté, un effet par section,
bouton « Passer l'intro » toujours visible pendant l'intro, tout le site en français.
