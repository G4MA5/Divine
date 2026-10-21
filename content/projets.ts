export type ThemeCouverture = "bone" | "blue" | "black" | "red" | "green" | "mint";
export type NomArt = "qr" | "library" | "stock" | "metro" | "tickets" | "rdv";

export type Projet = {
  slug: string;
  titre: string;
  /** taille du titre sur la couverture (unités de conteneur) */
  tailleTitre: string;
  rubrique: string;
  /** une phrase, pour le haut du dossier et les aperçus */
  chapo: string;
  description: string;
  stack: string[];
  fonctionnalites: string[];
  date?: string;
  role?: string;
  equipe?: string;
  statut?: string;
  lien?: string;
  /** la couverture du dossier */
  couverture: {
    theme: ThemeCouverture;
    disposition: "bottom" | "vertical";
    chevauche?: boolean;
    grand: { t: string; accent?: boolean }[];
    petit: string[];
    credit: string;
    art: NomArt;
  };
  /** captures d'écran (dans /public/images/projets/) : rien ne s'affiche tant qu'il n'y en a pas */
  captures?: string[];
};

export const projets: Projet[] = [
  {
    slug: "clinique-life",
    titre: "Clinique Life",
    tailleTitre: "12.5cqw",
    rubrique: "Site web médical",
    chapo: "Un site vitrine pour une clinique, avec prise de rendez-vous en ligne et un tableau de bord pour l'administration.",
    description:
      "Site vitrine avec système de prise de rendez-vous et dashboard admin. Réalisé en équipe avec GAMA LABS, de la conception à la mise en production.",
    stack: [],
    fonctionnalites: ["Prise de rendez-vous en ligne", "Tableau de bord d'administration"],
    equipe: "GAMA LABS",
    statut: "Mis en production",
    couverture: { theme: "mint", disposition: "bottom", grand: [{ t: "RDV" }, { t: "EN LIGNE", accent: true }], petit: ["Rendez-vous", "Dashboard admin"], credit: "Site web", art: "rdv" },
  },
  {
    slug: "genie-upb-admin",
    titre: "Génie UPB Admin",
    tailleTitre: "10cqw",
    rubrique: "Application mobile & web",
    chapo: "Le système qui inscrit et valide les participants du concours d'innovation de l'Université Polytechnique de Bingerville.",
    description:
      "Système d'inscription et de validation des participants, développé pour le concours d'innovation GeniUPB de l'Université Polytechnique de Bingerville. Projet officiel réalisé avec l'équipe GAMA LABS.",
    stack: ["Python", "FastAPI", "PostgreSQL", "Flutter", "Render", "Resend"],
    fonctionnalites: ["Gestion des inscriptions", "Contrôle d'accès par QR Code", "Suivi en temps réel", "Notifications automatisées"],
    date: "Janvier 2026",
    equipe: "GAMA LABS",
    statut: "Projet officiel",
    couverture: { theme: "bone", disposition: "bottom", chevauche: true, grand: [{ t: "QR" }, { t: "CODE !" }], petit: ["Inscriptions", "Temps réel"], credit: "FastAPI", art: "qr" },
  },
  {
    slug: "upb-students",
    titre: "UPB Student's",
    tailleTitre: "10.6cqw",
    rubrique: "Application mobile et site bibliothèque",
    chapo: "Une application pour les étudiants, les parents et l'administration, pensée comme un SaaS évolutif.",
    description:
      "Application pour étudiants, parents et administration (Flutter, Firebase), gestion des profils, architecture SaaS évolutive. Une version site web de bibliothèque est publiée en ligne.",
    stack: ["Flutter", "Firebase"],
    fonctionnalites: ["Synchronisation cloud", "Emploi du temps", "Mode hors-ligne", "Site web de la bibliothèque"],
    date: "Septembre 2023",
    statut: "Site bibliothèque publié",
    couverture: { theme: "blue", disposition: "bottom", grand: [{ t: "BIBLIO-" }, { t: "THÈQUE" }], petit: ["En ligne", "Publié"], credit: "Site web", art: "library" },
  },
  {
    slug: "inventist",
    titre: "Inventist",
    tailleTitre: "14.5cqw",
    rubrique: "Application de gestion de stock",
    chapo: "Le suivi des produits d'un salon de coiffure, en conditions réelles.",
    description: "Application mobile de gestion de stock, pensée principalement pour les salons de coiffure. En cours de déploiement au salon PELA Hair.",
    stack: [],
    fonctionnalites: ["Gestion de stock", "Pensée pour les salons de coiffure"],
    statut: "En cours de déploiement chez PELA Hair",
    couverture: { theme: "black", disposition: "vertical", chevauche: true, grand: [{ t: "STOCK" }, { t: "SALON", accent: true }], petit: ["Gestion de stock", "Salons de coiffure"], credit: "App mobile", art: "stock" },
  },
  {
    slug: "canopee",
    titre: "Canopée",
    tailleTitre: "16.5cqw",
    rubrique: "Gestion du SAV de CONTEOPRO",
    chapo: "Plateforme de gestion du service SAV du logiciel CONTEOPRO, réalisée pendant mon stage chez Top Telecom Services.",
    description:
      "Canopée permet de gérer le service après-vente (SAV) du logiciel CONTEOPRO. Ce projet a été réalisé dans le cadre de mon stage chez Top Telecom Services (anciennement appelé CONTEOPRO SAV).",
    stack: ["FastAPI", "React", "Supabase"],
    fonctionnalites: ["Gestion du service SAV", "Tickets d'assistance", "Missions et rapports"],
    equipe: "Top Telecom Services",
    couverture: { theme: "green", disposition: "bottom", grand: [{ t: "S.A.V." }], petit: ["Logiciel", "CONTEOPRO"], credit: "Projet de stage", art: "tickets" },
  },
  {
    slug: "metro",
    titre: "Metro",
    tailleTitre: "24cqw",
    rubrique: "Algorithmes et architecture",
    chapo: "Une architecture moderne avec routage dynamique et authentification JWT.",
    description: "Projet basé sur une architecture moderne avec authentification et visualisation.",
    stack: ["FastAPI", "Docker"],
    fonctionnalites: ["Routage dynamique", "Authentification JWT", "Visualisation"],
    couverture: { theme: "red", disposition: "vertical", grand: [{ t: "ROUTAGE" }, { t: "DYNAMIQUE", accent: true }], petit: ["Auth JWT", "Visualisation"], credit: "FastAPI", art: "metro" },
  },
];

export const projetParSlug = (slug: string) => projets.find((p) => p.slug === slug);
