"use client";

import { useContenu } from "@/components/ContenuProvider";
import { pad } from "@/content/sections";

/** Pied de page de chaque rubrique : « [div_dev_Now] — p. 07 ». */
export function PiedDePage({ page }: { page: number | string }) {
  const { identite } = useContenu();
  const num = typeof page === "number" ? pad(page) : page;
  return (
    <footer className="mt-16 sm:mt-24">
      <hr className="filet" />
      <p className="label mt-3 flex justify-between !text-fg">
        <span>{identite.magazine}</span>
        <span className="tabular-nums">p. {num}</span>
      </p>
    </footer>
  );
}
