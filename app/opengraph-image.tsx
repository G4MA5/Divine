import { ImageResponse } from "next/og";
import { CarteCouverture } from "@/lib/carte-og";

export const alt = "[div_dev_Now], le portfolio magazine de Divine Graourou";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <CarteCouverture titre="Développeuse full stack" rubrique="Numéro 01" accroche="DevOps junior · Support IT junior · 6 projets à la une" />,
    size,
  );
}
