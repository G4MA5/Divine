export type Projet = {
  slug: string;
  titre: string;
  rubrique: string;
  chapo: string;
  description: string;
  stack: string[];
  role: string;
  equipe: string;
  statut: string;
  lien?: string;
  /** Effet d'ouverture propre au reportage */
  ouverture: "rendez-vous" | "badge" | "livres" | "stock" | "ticket" | "metro";
  /** [À FOURNIR : captures d'écran] */
  captures: string[];
};

const aFournir = (x: string) => `[À FOURNIR : ${x}]`;

export const projets: Projet[] = [
  {
    slug: "clinique-life",
    titre: "Clinique Life",
    rubrique: "Site web médical",
    chapo: "Un site vitrine pour une clinique, avec prise de rendez-vous en ligne et un tableau de bord pour l'administration.",
    description:
      "Site vitrine avec système de prise de rendez-vous et dashboard admin. Réalisé en équipe avec GAMA LABS, de la conception à la mise en production.",
    stack: [aFournir("stack exacte")],
    role: aFournir("rôle exact"),
    equipe: "GAMA LABS",
    statut: "Mis en production",
    ouverture: "rendez-vous",
    captures: [],
  },
  {
    slug: "genie-upb-admin",
    titre: "Génie UPB Admin",
    rubrique: "Application mobile & web",
    chapo: "Le système qui inscrit et valide les participants d'un événement officiel de l'université.",
    description: "Système d'inscription et de validation des participants. Projet officiel réalisé avec l'équipe GAMA LABS.",
    stack: [aFournir("stack exacte")],
    role: aFournir("rôle exact"),
    equipe: "GAMA LABS",
    statut: "Projet officiel",
    ouverture: "badge",
    captures: [],
  },
  {
    slug: "upb-students",
    titre: "UPB Student's",
    rubrique: "Application mobile et site bibliothèque",
    chapo: "Une application pour les étudiants, les parents et l'administration, pensée comme un SaaS évolutif.",
    description:
      "Application pour étudiants, parents et administration (Flutter, Firebase), gestion des profils, architecture SaaS évolutive. Une version site web de bibliothèque est publiée.",
    stack: ["Flutter", "Firebase"],
    role: aFournir("rôle exact"),
    equipe: aFournir("équipe"),
    statut: "Site bibliothèque publié",
    lien: aFournir("lien de la bibliothèque"),
    ouverture: "livres",
    captures: [],
  },
  {
    slug: "inventist",
    titre: "Inventist",
    rubrique: "Application de gestion de stock",
    chapo: "Le suivi des produits d'un salon de coiffure, en conditions réelles.",
    description: "En cours de déploiement au salon de coiffure PELA Hair. Suivi et gestion des produits en conditions réelles.",
    stack: [aFournir("stack exacte")],
    role: aFournir("rôle exact"),
    equipe: aFournir("équipe"),
    statut: "En cours de déploiement chez PELA Hair",
    ouverture: "stock",
    captures: [],
  },
  {
    slug: "canopee",
    titre: "Canopée",
    rubrique: "Gestion du SAV de CONTEOPRO",
    chapo: "Projet réalisé pendant mon stage chez Top Telecom Services (anciennement appelé CONTEOPRO SAV).",
    description: aFournir("description détaillée"),
    stack: [aFournir("stack exacte")],
    role: aFournir("rôle exact"),
    equipe: "Top Telecom Services",
    statut: aFournir("statut"),
    ouverture: "ticket",
    captures: [],
  },
  {
    slug: "metro",
    titre: "Metro",
    rubrique: aFournir("rubrique"),
    chapo: aFournir("chapô"),
    description: aFournir("description"),
    stack: [aFournir("stack exacte")],
    role: aFournir("rôle exact"),
    equipe: aFournir("équipe"),
    statut: aFournir("statut"),
    ouverture: "metro",
    captures: [],
  },
];

export const projetParSlug = (slug: string) => projets.find((p) => p.slug === slug);
