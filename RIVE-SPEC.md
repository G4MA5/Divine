# RIVE-SPEC — cahier des charges des avatars animés

Les avatars actuels sont des **SVG animés avec GSAP** (`components/avatar/Avatar.tsx`, scène dans
`components/intro/SceneTable.tsx`). Ils suivent exactement les mêmes étapes que celles décrites ici :
quand les vrais fichiers Rive seront prêts, on remplace le SVG par `@rive-app/react-canvas` sans toucher à la scène.

## Fichiers attendus
Un fichier par avatar dans `public/rive/` :

| Fichier | Avatar |
|---|---|
| `recruteur.riv` | Le Recruteur |
| `curieuse.riv` | La Curieuse |
| `client.riv` | Le Client |
| `etudiante.riv` | L'Étudiante |

Chaque fichier contient **une state machine** nommée `Lecture`.

## Inputs de la state machine
| Input | Type | Rôle |
|---|---|---|
| `progress` | Number, 0 → 100 | Avancement de la scène, piloté par le scroll (ScrollTrigger scrub). Le scroll arrière doit rembobiner. |
| `seated` | Boolean | `true` pendant la rubrique Interview (avatar assis, carnet en main). |
| `hover` | Trigger | Petit clin d'œil quand on survole l'avatar (facultatif). |

## Étapes selon `progress` (valeurs de la scène actuelle, sur 11,7 unités → en %)
| % | Étape | Pose |
|---|---|---|
| 0 – 17 | Recul de caméra | avatar hors champ |
| 17 – 43 | **Marche** | entre par la gauche, un pas par cran de scroll (cycle de marche, 6 pas) |
| 43 – 52 | **Prise** | s'arrête, tend le bras droit vers le magazine, légère inclinaison de la tête |
| 52 – 64 | Soulève | le magazine monte vers lui |
| 64 – 77 | **Ouverture** | ouvre la couverture (la main suit la tranche) |
| 77 – 100 | Plongée | s'efface pendant que la caméra entre dans la double page |
| rubrique Interview | **Assis-intervieweur** | assis, carnet et stylo, regard vers la droite |
| quatrième de couverture | **Refermer** | revient, referme le magazine et le repose |

## Format
- Cadrage vertical, ratio 160 × 360 (comme le SVG de remplacement), pieds au bas du cadre.
- Fond transparent. Ombre au sol facultative.
- Palettes de référence : voir `STYLES` dans `Avatar.tsx` (peau, cheveux, vêtements).
- Durées : une marche de 3 s à vitesse normale, la prise 1 s, l'ouverture 1,5 s (valeurs indicatives : tout est piloté par `progress`).

## Brancher un fichier
1. Déposer `xxx.riv` dans `public/rive/`.
2. Dans `SceneTable.tsx`, remplacer `<Avatar id={id} />` par un composant `useRive({ src: "/rive/xxx.riv", stateMachines: "Lecture" })`.
3. Dans la timeline GSAP, remplacer les tweens des membres par `onUpdate` qui écrit `progress` dans l'input.
4. Garder le SVG comme repli si le fichier est absent.
