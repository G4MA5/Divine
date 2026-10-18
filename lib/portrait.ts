import { existsSync } from "node:fs";
import path from "node:path";
import { identite } from "@/content/identite";

/** Côté serveur : le portrait est-il déjà déposé dans /public ? */
export const portraitExiste = () => existsSync(path.join(process.cwd(), "public", identite.portrait));
