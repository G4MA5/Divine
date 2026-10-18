import type { MetadataRoute } from "next";
import { projets } from "@/content/projets";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    ...projets.map((p) => ({ url: `${SITE_URL}/reportages/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
