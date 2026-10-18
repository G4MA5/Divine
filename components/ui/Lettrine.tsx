import type { ReactNode } from "react";

/** Paragraphe à lettrine dorée. */
export function Lettrine({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`lettrine ${className}`.trim()}>{children}</p>;
}
