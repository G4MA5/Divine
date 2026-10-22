import { existsSync } from "node:fs";
import path from "node:path";

/** Un fichier de /public (chemin local) existe-t-il ? Une adresse http(s) (Supabase Storage) est considérée comme présente. */
export const fichierExiste = (chemin: string) => {
  if (!chemin) return false;
  if (/^https?:\/\//.test(chemin)) return true;
  return existsSync(path.join(process.cwd(), "public", chemin));
};
