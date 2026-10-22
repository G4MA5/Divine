/**
 * Les questions de l'interview. Dès qu'une `reponse` est renseignée, la question devient interactive
 * (l'avatar la propose, la réponse s'affiche en style magazine). Sans réponse, elle reste un teaser.
 */
export type QuestionInterview = { id: number; question: string; reponse?: string };

export const questions: QuestionInterview[] = [
  { id: 1, question: "Pourquoi le backend ?", reponse: "Parce que c'est là que la logique prend vie : les données, les règles, la sécurité. J'aime construire ce qu'on ne voit pas mais sur lequel tout repose, et qu'une application tienne la route quand les utilisateurs arrivent." },
  { id: 2, question: "Comment es-tu passée de la MIAGE à la cybersécurité et l'IA ?", reponse: "La MIAGE m'a appris à relier le code aux besoins des entreprises. Plus je construisais d'applications, plus la question de les protéger et de les rendre intelligentes s'imposait : le master en cybersécurité et IA est la suite logique." },
  { id: 3, question: "Quel projet te rend la plus fière ?", reponse: "Ceux que j'ai portés de bout en bout, comme Inventist et Canopée : de l'analyse au déploiement, seule aux commandes. On apprend énormément quand chaque décision est la sienne." },
  { id: 4, question: "Qu'as-tu appris en annotant des données pour un assistant vocal ?", reponse: "Que la qualité d'un modèle dépend de la qualité de ses données. Transcrire des enregistrements avec précision, c'est aider directement un assistant vocal à mieux comprendre les gens." },
  { id: 5, question: "C'est quoi, travailler en équipe chez GAMA LABS ?", reponse: "Nous sommes six ingénieurs et nous livrons de l'analyse au déploiement, avec une méthode en sept étapes. Chacun apporte ses forces, on se relit, on apprend les uns des autres : apprendre, créer, impacter." },
  { id: 6, question: "Le kung-fu, ça t'apporte quoi dans ton travail ?", reponse: "De la discipline et du calme. Répéter un mouvement jusqu'à ce qu'il soit juste, c'est comme corriger un bug : de la patience, de la méthode, et ne pas lâcher." },
  { id: 7, question: "Tennis ou code : où es-tu la plus stratège ?", reponse: "Les deux demandent d'anticiper. Au tennis, on lit le jeu avant de frapper ; en code, on pense l'architecture avant d'écrire. Au code, je suis plus stratège : j'ai le temps de réfléchir." },
  { id: 8, question: "Qu'est-ce que tu lis en ce moment ?" },
  { id: 9, question: "Ton plat signature ?" },
  { id: 10, question: "Qu'écoutes-tu quand tu codes ?" },
  { id: 11, question: "Où te vois-tu dans cinq ans ?", reponse: 'Ingénieure en cybersécurité et IA, à concevoir des systèmes fiables et sûrs, avec un GAMA Labs qui a grandi et des projets qui ont un vrai impact.' },
  { id: 12, question: "Pourquoi devrait-on travailler avec toi ?", reponse: "Parce que je livre de bout en bout, que je sécurise ce que je construis et que je travaille bien en équipe. Et parce que j'apprends vite : un nouveau défi est une bonne nouvelle." },
];
