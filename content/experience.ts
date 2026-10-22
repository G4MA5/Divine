export type Experience = {
  id: string;
  /** « Depuis 2023 », « Juin 2024 – Décembre 2024 »… : masqué s'il n'est pas renseigné */
  periode?: string;
  poste: string;
  entreprise: string;
  lieu?: string;
  /** une phrase de contexte sous le poste */
  resume?: string;
  missions: string[];
  /** couleur de fond de la carte (teinte douce propre à l'organisation) et couleur d'accent */
  fond: string;
  accent: string;
  /** logo : une image dans /public, sinon un monogramme */
  logo?: string;
  monogramme: string;
  /** un lien vers l'organisation */
  lien?: { texte: string; href: string };
};

export const experiences: Experience[] = [
  {
    id: "gama",
    fond: "#fdf1c9",
    accent: "#d99a00",
    logo: "/images/logos/logo-gama-cube.webp",
    monogramme: "G",
    periode: "Depuis 2023",
    poste: "Co-fondatrice",
    entreprise: "GAMA Labs",
    lieu: "Abidjan",
    resume: "Studio de sites, d'applications et de logiciels sur mesure, créé en 2023 avec cinq autres ingénieurs. Apprendre · Créer · Impacter.",
    missions: [
      "Sites web, applications web et applications mobiles (Flutter) livrés de l'analyse au déploiement",
      "Une méthode en sept étapes : analyse, spécification, conception, design, code, test, déploiement",
      "Des projets pour l'UPB et ses étudiants : Génie UPB, UpB Student's, Metro",
    ],
    lien: { texte: "gama-labs.com", href: "https://gama-labs.com" },
  },
  {
    id: "bde",
    fond: "#dff0e3",
    accent: "#2f7d4f",
    logo: "/images/logos/upb-logo.webp",
    monogramme: "BDE",
    poste: "Secrétaire générale du BDE",
    entreprise: "Bureau des étudiants, 6e promotion de l'UPB",
    lieu: "Bingerville",
    missions: [],
  },
  {
    id: "transsion",
    fond: "#dfeaf9",
    accent: "#2b5fb8",
    monogramme: "T",
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
    fond: "#fbe3da",
    accent: "#c4502a",
    monogramme: "TTS",
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
