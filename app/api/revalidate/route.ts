import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/**
 * Appelée par l'application de commande (ou par un webhook Supabase) après une modification :
 * le site se met à jour tout de suite au lieu d'attendre la minute de cache.
 *   POST /api/revalidate    en-tête : x-revalidate-secret: <REVALIDATE_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET ?? "";
  const recu = request.headers.get("x-revalidate-secret") ?? "";
  const a = Buffer.from(secret);
  const b = Buffer.from(recu);
  if (!secret || a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }
  revalidateTag("contenu", "max");
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
