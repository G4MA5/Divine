import { ImageResponse } from "next/og";
import { getContenu } from "@/lib/contenu-serveur";
import { CarteCouverture } from "@/lib/carte-og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const { projets } = await getContenu();
  return projets.map((p) => ({ slug: p.slug }));
}

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const { projets } = await getContenu();
  const p = projets.find((x) => x.slug === slug);
  const rubrique = p?.rubrique ?? "Reportage";
  return new ImageResponse(<CarteCouverture titre={p?.titre ?? "Reportage"} rubrique={`Reportage · ${rubrique}`} accroche="Un projet de Divine Graourou" />, size);
}
