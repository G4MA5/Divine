# TODO-CONTENU — ce qu'il me reste à fournir

Tout est cherchable dans le code avec `[À FOURNIR` ou `[À CONFIRMER`.

## Images et fichiers
- [x] Portrait de couverture : ta photo détourée de l'ancien site (`public/images/portrait.png`). Tu peux la remplacer par une photo avec plus d'espace au-dessus de la tête.
- [ ] **CV corrigé en PDF** → `public/cv/cv-divine.pdf` (le code-barres de la couverture le télécharge).
- [ ] **Captures d'écran des projets** (6) → `public/images/projets/<slug>/` puis les lister dans `content/projets.ts` (`captures`).
- [ ] **Sons** (facultatif, sinon synthétisés par le navigateur) → `public/sounds/`, puis renseigner le nom dans `FILES` de `lib/sound.ts` :
  `clic` (stylo), `machine` (machine à écrire), `papier` (froissement), `tic`, `page` (page tournée), `fermer` (page qui se ferme), `pop` (raquette), `woosh`, `tampon`, `gresillement`, `vinyle` (grain, en boucle).
- [ ] **Avatars Rive** (4 fichiers `.riv`) → `public/rive/` (voir `RIVE-SPEC.md`).

## Textes (dans `/content`)
- [ ] `edito.ts` : l'édito définitif (le texte actuel vient de ton ancien site)
- [ ] `interview.ts` : les 12 réponses
- [ ] `recette.ts` : le texte de « La recette » (temps, difficulté, étapes)
- [ ] « Prochain numéro » (encadré de la quatrième de couverture)
- [ ] Projets (`projets.ts`) : stack exacte, rôle, équipe, statut, lien pour chacun.
  - Canopée : description détaillée
  - Metro : description, stack, captures, et l'effet d'ouverture à définir
  - UPB Student's : lien de la bibliothèque

## Galerie « Divine à la peinture »
- [ ] **Images des tableaux** → `public/images/peinture/`, puis les déclarer dans `content/peinture.ts` (`image`, `titre`, `annee`, `technique`, `dimensions`, `ratio` = largeur / hauteur). Tant qu'elles manquent, des cadres vides s'affichent.
- [ ] Texte de présentation de la peinture (`peintureIntro.texte`).

## DevSecOps et sécurité (Boîte à outils)
- [ ] **À CONFIRMER** : `content/devsecops.ts` contient la chaîne DevSecOps classique (STRIDE, Gitleaks, SonarQube, Trivy, OWASP ZAP, Dependabot, SBOM…). Garder uniquement les outils que tu utilises vraiment, et ajuster le texte des « réflexes sécurité ».

## Liens et décisions
- [x] GitHub, Instagram, WhatsApp : repris de l'ancien site
- [ ] LinkedIn : lien (`content/identite.ts`)
- [ ] Afficher ou non le téléphone sur le site (`afficherTelephone` dans `content/identite.ts`)
- [ ] Ambiance de fond très légère (bruit de pages, café) : oui ou non ?
- [ ] Formulaire de contact : Formspree ou Resend (sinon repli sur `mailto:`)
