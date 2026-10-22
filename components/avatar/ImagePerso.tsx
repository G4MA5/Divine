"use client";

import { useEffect, useState } from "react";
import type { IdPerso } from "../scene3d/Personnage";

/** L'image d'un personnage 3D (têtes de fleur) pour les cartes de choix : rendue une fois, hors écran. */
export function ImagePerso({ id, className = "" }: { id: IdPerso; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let vivant = true;
    import("../scene3d/capturePersonnages")
      .then((m) => m.capturerPersonnages())
      .then((r) => vivant && setSrc(r[id]))
      .catch(() => undefined);
    return () => {
      vivant = false;
    };
  }, [id]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src ?? "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="} alt="" aria-hidden="true" draggable={false} className={`${className} transition-opacity duration-500 ${src ? "opacity-100" : "opacity-0"}`} style={{ aspectRatio: "300 / 460" }} />
  );
}
