export const identite = {
  magazine: "[div_dev_Now]",
  nom: "GRAOUROU Olivier Grace Divine",
  prenom: "Divine",
  titre: "Développeuse full stack | DevOps junior | Support IT junior",
  accroches: ["Développeuse full stack", "DevOps junior", "Support IT junior"],
  passions: ["Backend", "DevOps", "Vision par ordinateur", "IoT"],
  ville: "Abidjan, Côte d'Ivoire",
  email: "Graouroudivine@gmail.com",
  telephone: "(+225) 07 78 30 42 87",
  /** afficher ou non le téléphone sur le site */
  afficherTelephone: false,
  github: "https://github.com/divine-dev-now/",
  instagram: "https://www.instagram.com/divin____e/",
  whatsapp: "https://wa.me/2250778304287",
  linkedin: "",
  /** le CV, à déposer dans /public/cv/cv-divine.pdf (le lien n'apparaît que si le fichier existe) */
  cv: "/cv/cv-divine.pdf",
  /** le portrait, dans /public/images/portrait.png */
  portrait: "/images/portrait.png",
  numero: "N° 01",
  langues: [
    { langue: "Français", niveau: "courant" },
    { langue: "Anglais", niveau: "niveau A2" },
  ],
  centresInteret: ["Lecture", "Kung-fu", "Tennis", "Musique", "Cuisine"],
} as const;
