import { cacheLife, cacheTag } from "next/cache";
import { chargerContenu, type Contenu } from "./contenu";

/**
 * Le contenu du site côté serveur, mis en cache : il se rafraîchit tout seul (environ chaque minute) et immédiatement
 * quand l'application de commande appelle /api/revalidate (voir app/api/revalidate/route.ts).
 */
export async function getContenu(): Promise<Contenu> {
  "use cache";
  cacheLife("minutes");
  cacheTag("contenu");
  return chargerContenu();
}
