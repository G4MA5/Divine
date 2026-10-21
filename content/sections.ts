/** Les rubriques du magazine, avec leur numéro de page (source du sommaire, du marque-page et de l'indicateur). */
export type Rubrique = {
  id: string;
  titre: string;
  /** première page */
  page: number;
  /** dernière page (si la rubrique occupe une double page ou plus) */
  fin?: number;
  accroche: string;
};

export const TOTAL_PAGES = 21;

export const rubriques: Rubrique[] = [
  { id: "sommaire", titre: "Sommaire", page: 2, accroche: "Ce qu'il y a dans ce numéro" },
  { id: "edito", titre: "Édito", page: 3, accroche: "Un mot avant de tourner la page" },
  { id: "parcours", titre: "Parcours", page: 4, fin: 5, accroche: "D'où je viens, où je vais" },
  { id: "experience", titre: "Expérience", page: 6, fin: 7, accroche: "Au travail, sur le terrain" },
  { id: "reportages", titre: "Reportages", page: 8, fin: 15, accroche: "Six projets à la une" },
  { id: "competences", titre: "Boîte à outils", page: 16, accroche: "Treize outils, du mobile aux données" },
  { id: "atouts", titre: "Atouts", page: 17, accroche: "Ce qui me définit" },
  { id: "recette", titre: "La Recette", page: 18, accroche: "Ma méthode de travail" },
  { id: "interview", titre: "Interview", page: 19, fin: 20, accroche: "Posez vos questions" },
  { id: "quatrieme", titre: "Quatrième de couverture", page: 21, accroche: "Écrivez-moi" },
];

export const pageLabel = (r: Rubrique) => (r.fin ? `${r.page}-${r.fin}` : `${r.page}`);
export const pad = (n: number) => String(n).padStart(2, "0");
