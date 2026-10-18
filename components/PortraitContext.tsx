"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Vrai quand le fichier public/images/portrait.png existe (évite une requête 404 en attendant le portrait). */
const Ctx = createContext(true);

export function PortraitProvider({ disponible, children }: { disponible: boolean; children: ReactNode }) {
  return <Ctx.Provider value={disponible}>{children}</Ctx.Provider>;
}

export const usePortraitDisponible = () => useContext(Ctx);
