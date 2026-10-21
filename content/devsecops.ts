/**
 * DevSecOps et sécurité, pour la Boîte à outils.
 * À CONFIRMER : la liste des outils est la chaîne DevSecOps classique ; garder seulement ceux que j'utilise vraiment.
 */
export type EtapeDevSecOps = {
  nom: string;
  /** la porte de sécurité de l'étape */
  garde: string;
  outils: string[];
};

export const devsecops = {
  titre: "DevSecOps",
  chapo: "Livrer vite, sans jamais livrer à l'aveugle : la sécurité n'est pas une étape à la fin, elle est dans chaque étape.",
  texte:
    "Je suis développeuse, je fais du DevOps et je prépare un Master en Ingénierie Cybersécurité et IA. Mon réflexe : chaque ligne de code et chaque déploiement passent par une porte de sécurité, automatisée dès que possible, pour que la vitesse ne coûte jamais la fiabilité.",
  etapes: [
    { nom: "Plan", garde: "Modéliser les menaces, écrire les exigences de sécurité", outils: ["STRIDE", "OWASP ASVS"] },
    { nom: "Code", garde: "Détecter les secrets et les failles avant le commit", outils: ["Git", "GitHub", "Gitleaks", "SonarQube"] },
    { nom: "Build", garde: "Auditer les dépendances et les images", outils: ["Docker", "GitHub Actions", "Dependabot", "Trivy"] },
    { nom: "Test", garde: "Attaquer sa propre application avant les autres", outils: ["Tests automatisés", "OWASP ZAP"] },
    { nom: "Release", garde: "Livrer un artefact traçable et vérifié", outils: ["SBOM", "Versions signées"] },
    { nom: "Deploy", garde: "Secrets hors du code, droits minimums", outils: ["Render", "Variables d'environnement"] },
    { nom: "Operate", garde: "Surveiller, journaliser, alerter", outils: ["Journaux", "Alertes"] },
    { nom: "Learn", garde: "Corriger vite et en tirer une règle", outils: ["Post-mortem", "Mises à jour continues"] },
  ] as EtapeDevSecOps[],
};

export const securite = {
  titre: "Sécurité",
  chapo: "Mes réflexes, sur chaque projet.",
  principes: [
    { titre: "Authentification", texte: "Jetons JWT, sessions courtes, mots de passe jamais stockés en clair." },
    { titre: "Contrôle d'accès", texte: "Moindre privilège : règles Firebase et politiques RLS de Supabase pour que chacun ne voie que ses données." },
    { titre: "Secrets", texte: "Aucune clé dans le code : variables d'environnement, rotation, analyse des dépôts." },
    { titre: "Entrées et sorties", texte: "Validation côté serveur, requêtes paramétrées, protection contre le Top 10 OWASP." },
    { titre: "Dépendances", texte: "Audit et mises à jour automatiques : on ne livre pas une faille connue." },
    { titre: "Traçabilité", texte: "Journaux et alertes : ce qui n'est pas observé ne peut pas être défendu." },
  ],
};
