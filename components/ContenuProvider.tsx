"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Contenu } from "@/lib/contenu";

const Ctx = createContext<Contenu | null>(null);

/** Donne le contenu du site (venu de Supabase ou du dossier /content) à tous les composants. */
export function ContenuProvider({ contenu, children }: { contenu: Contenu; children: ReactNode }) {
  return <Ctx.Provider value={contenu}>{children}</Ctx.Provider>;
}

export function useContenu(): Contenu {
  const c = useContext(Ctx);
  if (!c) throw new Error("useContenu doit être utilisé dans un <ContenuProvider>");
  return c;
}
