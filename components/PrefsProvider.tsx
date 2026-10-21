"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Préférences du visiteur : thème, son, avatar.
 * Tout est mémorisé dans localStorage, toujours enveloppé dans try/catch : le site marche sans.
 */

export type ThemeChoice = "light" | "dark";

type Prefs = {
  /** thème effectivement affiché */
  theme: ThemeChoice;
  toggleTheme: () => void;
  /** son : coupé par défaut, jamais lancé sans action explicite */
  sound: boolean;
  setSound: (on: boolean) => void;
  avatar: string | null;
  setAvatar: (id: string | null) => void;
  /** true quand le visiteur a déjà fait ses choix lors d'une visite précédente */
  hasSaved: boolean;
  /** true une fois les préférences lues côté client */
  ready: boolean;
  reducedMotion: boolean;
};

const Ctx = createContext<Prefs | null>(null);

const KEY = { theme: "divnow-theme", sound: "divnow-sound", avatar: "divnow-avatar" };

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* stockage bloqué : le choix ne dure que pour cette visite */
  }
};

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeChoice>("light");
  const [sound, setSoundState] = useState(false);
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    // le fond est un blanc pur et fixe : il n'y a plus de mode sombre
    setTheme("light");
    const av = read(KEY.avatar);
    setAvatarState(av);
    setSoundState(read(KEY.sound) === "1");
    setHasSaved(!!av);
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(rm.matches);
    const onRm = () => setReducedMotion(rm.matches);
    rm.addEventListener("change", onRm);
    setReady(true);
    return () => rm.removeEventListener("change", onRm);
  }, []);

  // suit le système tant que le visiteur n'a rien choisi
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (read(KEY.theme) === null) setTheme(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // le son se coupe quand l'onglet n'est plus visible
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        import("@/lib/sound").then((m) => m.suspend());
      } else {
        import("@/lib/sound").then((m) => m.resume());
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      write(KEY.theme, next);
      return next;
    });
  }, []);

  const setSound = useCallback((on: boolean) => {
    setSoundState(on);
    write(KEY.sound, on ? "1" : "0");
    import("@/lib/sound").then((m) => m.setEnabled(on));
  }, []);

  const setAvatar = useCallback((id: string | null) => {
    setAvatarState(id);
    write(KEY.avatar, id);
    setHasSaved(!!id);
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, sound, setSound, avatar, setAvatar, hasSaved, ready, reducedMotion }),
    [theme, toggleTheme, sound, setSound, avatar, setAvatar, hasSaved, ready, reducedMotion],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePrefs doit être utilisé dans <PrefsProvider>");
  return v;
}
