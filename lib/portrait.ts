import { existsSync } from "node:fs";
import path from "node:path";
import { identite } from "@/content/identite";

const existe = (chemin: string) => existsSync(path.join(process.cwd(), "public", chemin));

/** Côté serveur : le portrait et le CV sont-ils déjà déposés dans /public ? */
export const portraitExiste = () => existe(identite.portrait);
export const cvExiste = () => existe(identite.cv);
