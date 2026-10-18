# TODO-CONTENU — ce qu'il me reste à fournir

Tout est cherchable dans le code avec `[À FOURNIR` ou `[À CONFIRMER`.

## Images et fichiers
- [ ] **Portrait de couverture** → `public/images/portrait.png` (idéalement détouré, fond transparent, avec de l'espace au-dessus de la tête pour le titre). En attendant, une silhouette s'affiche.
- [ ] **CV corrigé en PDF** → `public/cv/cv-divine.pdf` (le code-barres de la couverture le télécharge).
- [ ] **Captures d'écran des projets** (6) → `public/images/projets/<slug>/` puis les lister dans `content/projets.ts` (`captures`).
- [ ] **Sons** (facultatif, sinon synthétisés par le navigateur) → `public/sounds/`, puis renseigner le nom dans `FILES` de `lib/sound.ts` :
  `clic` (stylo), `machine` (machine à écrire), `papier` (froissement), `tic`, `page` (page tournée), `fermer` (page qui se ferme), `pop` (raquette), `woosh`, `tampon`, `gresillement`, `vinyle` (grain, en boucle).
- [ ] **Avatars Rive** (4 fichiers `.riv`) → `public/rive/` (voir `RIVE-SPEC.md`).

## Textes (dans `/content`)
- [ ] `edito.ts` : l'édito
- [ ] `interview.ts` : les 12 réponses
- [ ] `recette.ts` : le texte de « La recette » (temps, difficulté, étapes)
- [ ] « Prochain numéro » (encadré de la quatrième de couverture)
- [ ] Projets (`projets.ts`) : stack exacte, rôle, équipe, statut, lien pour chacun.
  - Canopée : description détaillée
  - Metro : description, stack, captures, et l'effet d'ouverture à définir
  - UPB Student's : lien de la bibliothèque

## Liens et décisions
- [ ] GitHub : lien (`content/identite.ts`)
- [ ] LinkedIn : lien (`content/identite.ts`)
- [ ] Afficher ou non le téléphone sur le site (`afficherTelephone` dans `content/identite.ts`)
- [ ] Ambiance de fond très légère (bruit de pages, café) : oui ou non ?
- [ ] Formulaire de contact : Formspree ou Resend (sinon repli sur `mailto:`)
