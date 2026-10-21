/**
 * Les questions de l'interview. Dès qu'une `reponse` est renseignée, la question devient interactive
 * (l'avatar la propose, la réponse s'affiche en style magazine). Sans réponse, elle reste un teaser.
 */
export type QuestionInterview = { id: number; question: string; reponse?: string };

export const questions: QuestionInterview[] = [
  { id: 1, question: "Pourquoi le backend ?" },
  { id: 2, question: "Comment es-tu passée de la MIAGE à la cybersécurité et l'IA ?" },
  { id: 3, question: "Quel projet te rend la plus fière ?" },
  { id: 4, question: "Qu'as-tu appris en annotant des données pour un assistant vocal ?" },
  { id: 5, question: "C'est quoi, travailler en équipe chez GAMA LABS ?" },
  { id: 6, question: "Le kung-fu, ça t'apporte quoi dans ton travail ?" },
  { id: 7, question: "Tennis ou code : où es-tu la plus stratège ?" },
  { id: 8, question: "Qu'est-ce que tu lis en ce moment ?" },
  { id: 9, question: "Ton plat signature ?" },
  { id: 10, question: "Qu'écoutes-tu quand tu codes ?" },
  { id: 11, question: "Où te vois-tu dans cinq ans ?" },
  { id: 12, question: "Pourquoi devrait-on travailler avec toi ?" },
];
