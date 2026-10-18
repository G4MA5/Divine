import type { ReactNode } from "react";

/** Citation en très grand format (pull quote). */
export function Citation({ children, auteur }: { children: ReactNode; auteur?: string }) {
  return (
    <figure className="my-12 border-y border-accent/50 py-8">
      <blockquote className="pull-quote">« {children} »</blockquote>
      {auteur && <figcaption className="label mt-4">{auteur}</figcaption>}
    </figure>
  );
}
