import { ImageResponse } from "next/og";
import { projetParSlug, projets } from "@/content/projets";
import { CarteCouverture } from "@/lib/carte-og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projets.map((p) => ({ slug: p.slug }));
}

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const p = projetParSlug(slug);
  const rubrique = p?.rubrique ?? "Reportage";
  return new ImageResponse(<CarteCouverture titre={p?.titre ?? "Reportage"} rubrique={`Reportage · ${rubrique}`} accroche="Un projet de Divine Graourou" />, size);
}
