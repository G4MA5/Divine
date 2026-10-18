"use client";

import Image from "next/image";
import { useState } from "react";
import { identite } from "@/content/identite";
import { usePortraitDisponible } from "../PortraitContext";

/** Mon portrait, ou une silhouette en attendant le fichier (public/images/portrait.png). */
export function Portrait({ className = "" }: { className?: string }) {
  const dispo = usePortraitDisponible();
  const [ok, setOk] = useState(true);
  if (ok && dispo) {
    return (
      <Image
        src={identite.portrait}
        alt="Portrait de Divine Graourou"
        width={442}
        height={890}
        className={className}
        onError={() => setOk(false)}
      />
    );
  }
  return (
    <svg viewBox="0 0 400 520" className={className} role="img" aria-label="Silhouette en attendant le portrait">
      <path d="M0 520c8-110 60-150 130-168l50-14h40l50 14c70 18 122 58 130 168Z" fill="var(--fg)" opacity=".85" />
      <rect x="168" y="262" width="64" height="80" rx="28" fill="var(--fg)" opacity=".85" />
      <ellipse cx="200" cy="190" rx="78" ry="96" fill="var(--fg)" opacity=".85" />
      <path d="M118 190c-10-84 36-132 82-132s92 48 82 132c-18-40-48-62-82-62s-64 22-82 62Z" fill="var(--bg)" opacity=".55" />
    </svg>
  );
}
