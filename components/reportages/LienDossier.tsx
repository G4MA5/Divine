"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * « Ouvrir la page » : la page du projet est préchargée dès que le dossier s'ouvre, et au clic un écran « Ouverture… »
 * répond tout de suite, sans attendre la fin du chargement de la nouvelle page.
 */
export function LienDossier({ slug, titre }: { slug: string; titre: string }) {
  const router = useRouter();
  const [ouverture, setOuverture] = useState(false);
  const href = `/reportages/${slug}`;

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  return (
    <>
      <Link href={href} prefetch className="btn" onClick={() => setOuverture(true)}>
        Ouvrir la page →
      </Link>
      {ouverture &&
        createPortal(
          <div role="status" aria-live="polite" className="fixed inset-0 z-[97] flex flex-col items-center justify-center gap-4 bg-white">
            <span aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-[3px] border-ink/15 border-t-gold" />
            <p className="font-display text-2xl font-bold italic">Ouverture du dossier {titre}…</p>
          </div>,
          document.body,
        )}
    </>
  );
}
