export type EtapeParcours = {
  periode: string;
  titre: string;
  lieu: string;
  detail?: string;
  /** une branche git : une étape parallèle qui part de la précédente et revient avant la suivante (ex. un certificat) */
  branche?: boolean;
};

export const parcours: EtapeParcours[] = [
  {
    periode: "2022-2023",
    titre: "Baccalauréat Général, série D",
    lieu: "Collège Pascal de Koumassi",
  },
  {
    periode: "2023-2026",
    titre: "Licence MIAGE",
    lieu: "Université Polytechnique de Bingerville (UPB)",
    detail: "Méthodes Informatiques Appliquées à la Gestion des Entreprises",
  },
  {
    periode: "Avril 2024",
    titre: "Certificat « Speaking and Presenting – Conversation Starters »",
    lieu: "Université du Michigan, via MTN Skills Academy",
    branche: true,
  },
  {
    periode: "Depuis 2026",
    titre: "Master Ingénierie Cybersécurité et IA",
    lieu: "Université Polytechnique de Bingerville (UPB)",
  },
];
