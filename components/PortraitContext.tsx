"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Les fichiers déposés dans /public : le portrait et le CV (rien ne s'affiche pour un fichier absent). */
const Ctx = createContext({ portrait: true, cv: false });

export function PortraitProvider({ disponible, cv = false, children }: { disponible: boolean; cv?: boolean; children: ReactNode }) {
  return <Ctx.Provider value={{ portrait: disponible, cv }}>{children}</Ctx.Provider>;
}

export const usePortraitDisponible = () => useContext(Ctx).portrait;
export const useCvDisponible = () => useContext(Ctx).cv;
