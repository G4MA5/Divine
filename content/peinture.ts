/**
 * La galerie « Divine à la peinture ».
 * Pour ajouter un tableau : déposer l'image dans /public/images/peinture/ et renseigner `image`
 * (ex. "/images/peinture/mon-tableau.jpg"), avec son `titre`, `annee`, `technique`, `dimensions` si on le souhaite.
 * Les cadres sans image restent des cadres vides, sans aucun texte.
 */
export type Tableau = {
  id: string;
  titre?: string;
  annee?: string;
  technique?: string;
  dimensions?: string;
  image?: string;
  /** proportions du cadre : largeur / hauteur */
  ratio: number;
};

export const peintureIntro = {
  titre: "Divine à la peinture",
  chapo: "Quand je ne code pas, je peins.",
};

export const tableaux: Tableau[] = [
  { id: "t1", ratio: 3 / 4 },
  { id: "t2", ratio: 4 / 3 },
  { id: "t3", ratio: 1 },
  { id: "t4", ratio: 3 / 4 },
  { id: "t5", ratio: 4 / 5 },
  { id: "t6", ratio: 5 / 4 },
];
