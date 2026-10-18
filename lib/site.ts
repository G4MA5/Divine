/** Adresse publique du site (à renseigner dans NEXT_PUBLIC_SITE_URL sur Vercel, avec le nom de domaine). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
