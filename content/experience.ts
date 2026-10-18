export type Experience = {
  id: "transsion" | "ttsc";
  periode: string;
  poste: string;
  entreprise: string;
  lieu: string;
  missions: string[];
};

export const experiences: Experience[] = [
  {
    id: "transsion",
    periode: "Juin 2024 – Décembre 2024",
    poste: "Data Annotator",
    entreprise: "Transsion Holding",
    lieu: "Abidjan",
    missions: [
      "Transcription de données audio en texte",
      "Contribution à l'amélioration d'un assistant vocal",
      "Travail sur des données réelles et amélioration de modèles",
    ],
  },
  {
    id: "ttsc",
    periode: "Mai 2026 – Novembre 2026",
    poste: "Support IT",
    entreprise: "Top Telecom Services",
    lieu: "Abidjan",
    missions: [
      "Tests du logiciel CONTEOPRO (ERP de gestion hôtelière et restauration)",
      "Formation des utilisateurs de CONTEOPRO",
      "Assistance client",
    ],
  },
];
