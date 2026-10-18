export type Couleur = "coral" | "jaune" | "bleu" | "vert" | "violet" | "teal" | "orange" | "nuit" | "creme";

export type Projet = {
  slug: string;
  titre: string;
  rubrique: string;
  chapo: string;
  description: string;
  stack: string[];
  fonctionnalites: string[];
  date?: string;
  role: string;
  equipe: string;
  statut: string;
  lien?: string;
  /** Effet d'ouverture propre au reportage */
  ouverture: "rendez-vous" | "badge" | "livres" | "stock" | "ticket" | "metro";
  /** La couleur du reportage (toute la double page change de monde) */
  couleur: Couleur;
  /** Logo du projet (dans /public/images/logos), posé sur une pastille blanche */
  logo?: string;
  /** Illustration d'ambiance (dans /public/images/illu) */
  illu: string;
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
    fonctionnalites: ["Prise de rendez-vous en ligne", "Tableau de bord d'administration"],
    role: aFournir("rôle exact"),
    equipe: "GAMA LABS",
    statut: "Mis en production",
    ouverture: "rendez-vous",
    couleur: "vert",
    illu: "plante-jaune.svg",
    captures: [],
  },
  {
    slug: "genie-upb-admin",
    titre: "Génie UPB Admin",
    rubrique: "Application mobile & web",
    chapo: "Le système qui inscrit et valide les participants du concours d'innovation de l'Université Polytechnique de Bingerville.",
    description:
      "Système d'inscription et de validation des participants. Projet officiel réalisé avec l'équipe GAMA LABS pour le concours d'innovation GeniUPB.",
    stack: ["Python", "FastAPI", "PostgreSQL", "Flutter", "Render", "Resend"],
    fonctionnalites: ["Gestion des inscriptions", "Contrôle d'accès par QR Code", "Suivi en temps réel", "Notifications automatisées"],
    date: "Janvier 2026",
    role: aFournir("rôle exact"),
    equipe: "GAMA LABS",
    statut: "Projet officiel",
    ouverture: "badge",
    couleur: "bleu",
    logo: "genie-upb.png",
    illu: "equipe.svg",
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
    fonctionnalites: ["Synchronisation cloud", "Emploi du temps", "Mode hors-ligne", "Suivi des crédits"],
    date: "Septembre 2023",
    role: aFournir("rôle exact"),
    equipe: aFournir("équipe"),
    statut: "Site bibliothèque publié",
    lien: aFournir("lien de la bibliothèque"),
    ouverture: "livres",
    couleur: "orange",
    logo: "upb-students.png",
    illu: "etudiante.svg",
    captures: [],
  },
  {
    slug: "inventist",
    titre: "Inventist",
    rubrique: "Application de gestion de stock",
    chapo: "Le suivi des produits d'un salon de coiffure, en conditions réelles.",
    description: "En cours de déploiement au salon de coiffure PELA Hair. Suivi et gestion des produits en conditions réelles.",
    stack: [aFournir("stack exacte")],
    fonctionnalites: ["Suivi des produits", "Gestion du stock"],
    role: aFournir("rôle exact"),
    equipe: aFournir("équipe"),
    statut: "En cours de déploiement chez PELA Hair",
    ouverture: "stock",
    couleur: "violet",
    illu: "rapport.svg",
    captures: [],
  },
  {
    slug: "canopee",
    titre: "Canopée",
    rubrique: "Gestion du SAV de CONTEOPRO",
    chapo: "Projet réalisé pendant mon stage chez Top Telecom Services (anciennement appelé CONTEOPRO SAV).",
    description: aFournir("description détaillée"),
    stack: [aFournir("stack exacte")],
    fonctionnalites: ["Gestion des tickets SAV"],
    role: aFournir("rôle exact"),
    equipe: "Top Telecom Services",
    statut: aFournir("statut"),
    ouverture: "ticket",
    couleur: "teal",
    illu: "arbre.svg",
    captures: [],
  },
  {
    slug: "metro",
    titre: "Metro",
    rubrique: aFournir("rubrique"),
    chapo: aFournir("chapô"),
    description: aFournir("description"),
    stack: [aFournir("stack exacte")],
    fonctionnalites: [],
    role: aFournir("rôle exact"),
    equipe: aFournir("équipe"),
    statut: aFournir("statut"),
    ouverture: "metro",
    couleur: "jaune",
    logo: "metro.png",
    illu: "avion.svg",
    captures: [],
  },
];

export const projetParSlug = (slug: string) => projets.find((p) => p.slug === slug);
