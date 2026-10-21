/**
 * La galerie « Divine à la peinture ».
 * Pour ajouter un tableau : déposer l'image dans /public/images/peinture/ et renseigner `image`
 * (ex. "/images/peinture/mon-tableau.jpg"). Tant que `image` est absent, un cadre vide s'affiche.
 */
export type Tableau = {
  id: string;
  titre: string;
  annee?: string;
  technique?: string;
  dimensions?: string;
  image?: string;
  /** proportions du cadre, tant que l'image n'est pas là : largeur / hauteur */
  ratio: number;
};

export const peintureIntro = {
  titre: "Divine à la peinture",
  chapo: "Quand je ne code pas, je peins.",
  /** [À FOURNIR : texte sur ma peinture] */
  texte: "[À FOURNIR : quelques lignes sur ma peinture, ce qui m'inspire, mes techniques]",
};

export const tableaux: Tableau[] = [
  { id: "t1", titre: "[À FOURNIR : titre du tableau]", ratio: 3 / 4 },
  { id: "t2", titre: "[À FOURNIR : titre du tableau]", ratio: 4 / 3 },
  { id: "t3", titre: "[À FOURNIR : titre du tableau]", ratio: 1 },
  { id: "t4", titre: "[À FOURNIR : titre du tableau]", ratio: 3 / 4 },
  { id: "t5", titre: "[À FOURNIR : titre du tableau]", ratio: 4 / 5 },
  { id: "t6", titre: "[À FOURNIR : titre du tableau]", ratio: 5 / 4 },
];
