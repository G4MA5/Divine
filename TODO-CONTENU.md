# Ce qui reste à renseigner (rien n'est affiché tant que ce n'est pas renseigné)

Le site n'affiche plus aucun texte « à fournir » : un champ vide disparaît tout simplement.

## Fichiers
- `public/cv/cv-divine.pdf` : le CV (le code-barres de la couverture et le bouton « Télécharger le CV » apparaissent dès que le fichier existe).
- `public/images/peinture/` + `content/peinture.ts` : les tableaux de la galerie (cadres vides en attendant).
- `public/images/projets/` + `captures` dans `content/projets.ts` : captures d'écran des projets.
- `public/sounds/` (facultatif) : sinon les sons sont synthétisés. Voir `lib/sound.ts`.
- `public/rive/` : les avatars Rive (voir `RIVE-SPEC.md`).

## Textes (dans `/content`)
- `interview.ts` : 9 réponses rédigées (à relire et corriger avec tes mots) ; il manque les questions 8 (lecture), 9 (plat signature) et 10 (musique) : elles restent des teasers tant que `reponse` est vide.
- `recette.ts` : la recette (ma méthode de travail) est rédigée ; à relire et à ajuster avec tes mots.
- `projets.ts` : `stack`, `role`, `lien` pour chaque projet ; `captures`.
- `experience.ts` : la période et les missions du BDE ; les logos de Transsion et de Top Telecom Services (en attendant, un monogramme coloré s'affiche ; déposer le fichier dans `public/images/logos/` et renseigner `logo`).
- `identite.ts` : `linkedin` (à fournir ; le lien n'apparaît qu'une fois renseigné). Le téléphone est affiché.
- `competences.ts` : confirmer les outils DevSecOps et sécurité.

## Composants React Bits utilisés (dans `components/reactbits/`)
Scroll Stack (Expérience), Bounce Cards (Peinture), Staggered Menu (bouton Sommaire), Flowing Menu (page Sommaire),
Sling Button (envoi du message), Lightfall (écran de chargement), Glow Cursor (curseur orange).
Ils ont été adaptés : pas d'ombres portées, pas de dépendance à Hugeicons, libellés en français.
