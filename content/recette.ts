/** « La Recette » : ma méthode de travail, racontée comme une recette de cuisine. */
export const recette: {
  titre: string;
  sousTitre: string;
  intro: string;
  temps?: string;
  difficulte?: string;
  pour: string;
  ingredients: string[];
  etapes: { nom: string; texte: string }[];
} = {
  titre: "La Recette",
  sousTitre: "Comment je transforme une idée en logiciel",
  intro: "Une recette, c'est des ingrédients et un ordre. Un projet aussi : on ne saute pas d'étape, et on goûte avant de servir.",
  temps: "Du brief à la mise en ligne",
  difficulte: "Elle se corse avec le cahier des charges",
  pour: "1 projet, 1 équipe",
  ingredients: ["Un besoin bien compris", "Une équipe qui s'écoute", "Du Git à volonté", "Du code propre", "Des tests", "Une pincée de sécurité", "Un déploiement soigné"],
  etapes: [
    { nom: "Analyser", texte: "Comprendre le vrai besoin : qui utilisera le produit, pourquoi, et ce qui existe déjà." },
    { nom: "Spécifier", texte: "Écrire ce que le produit doit faire et dans quel ordre, avant d'écrire la moindre ligne de code." },
    { nom: "Concevoir", texte: "Dessiner l'architecture, le modèle de données et l'API : diagrammes UML, schémas, choix techniques." },
    { nom: "Dessiner", texte: "Maquetter les écrans et les parcours, choisir la typographie et les couleurs : ça doit être beau et clair." },
    { nom: "Coder", texte: "Une branche Git par fonctionnalité, de petits commits, des relectures. Le backend d'abord, l'interface ensuite." },
    { nom: "Tester", texte: "Tester, corriger, puis vérifier la sécurité (analyse du code et des dépendances) avant de livrer." },
    { nom: "Déployer", texte: "Mettre en ligne de façon automatisée (CI/CD), puis écouter les retours des utilisateurs pour la version suivante." },
  ],
};
