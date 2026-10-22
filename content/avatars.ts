export type Avatar = { id: string; rubrique: string; description: string };

/** Des personnages à tête de tournesol, sans genre : seuls changent la tenue et la fleur. */
export const avatars: Avatar[] = [
  { id: "recruteur", rubrique: "Recrutement", description: "Veste bleu nuit, carnet de notes" },
  { id: "curieuse", rubrique: "Curiosité", description: "Salopette verte, lunettes rondes" },
  { id: "client", rubrique: "Projet", description: "Veste grise, tablette sous le bras" },
  { id: "etudiante", rubrique: "Études", description: "Sac à dos, casque autour du cou" },
];
