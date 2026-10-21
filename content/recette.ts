/** « La Recette » : ma méthode de travail. `temps`, `difficulte` et `etapes` n'apparaissent que s'ils sont renseignés. */
export const recette: {
  titre: string;
  sousTitre: string;
  temps?: string;
  difficulte?: string;
  pour: string;
  ingredients: string[];
  etapes: string[];
} = {
  titre: "La Recette",
  sousTitre: "Ma méthode de travail",
  pour: "pour 1 projet",
  ingredients: ["Git", "Flutter", "Spring Boot", "PostgreSQL", "Supabase", "Firebase", "Next.js", "Python"],
  etapes: [],
};
