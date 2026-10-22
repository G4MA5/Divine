import type { MetadataRoute } from "next";
import { getContenu } from "@/lib/contenu-serveur";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projets } = await getContenu();
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    ...projets.map((p) => ({ url: `${SITE_URL}/reportages/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
