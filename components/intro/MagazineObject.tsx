import { Couverture } from "./Couverture";
import { rubriques, pad, pageLabel } from "@/content/sections";
import { identite } from "@/content/identite";

/**
 * Le magazine en 3D : page de droite + couverture qui pivote autour de la reliure (son dos est la page de gauche).
 * Les parties portent data-s pour que les scènes GSAP les pilotent. La taille vient de la variable CSS --mw
 * posée par la scène parente. `variant` choisit le contenu des pages intérieures :
 * « sommaire » à l'ouverture, « fin » quand l'avatar referme le magazine.
 */
export function MagazineObject({ variant = "sommaire" }: { variant?: "sommaire" | "fin" }) {
  const fin = variant === "fin";
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1600px" }}>
      <div
        data-s="mag-pos"
        className="relative will-change-transform"
        style={{ width: "var(--mw)", height: "calc(var(--mw) * 4 / 3)", transformStyle: "preserve-3d" }}
      >
        {/* ombre portée */}
        <div className="absolute inset-0 shadow-[0_30px_60px_-20px_rgba(0,0,0,.55)]" aria-hidden="true" />

        {/* page de droite */}
        <div className="absolute inset-0 bg-paper text-ink" style={{ containerType: "inline-size" }} aria-hidden="true">
          {fin ? (
            <div className="absolute inset-[7cqw] flex flex-col justify-center text-center">
              <p className="font-sans uppercase tracking-[0.26em] text-ink/60" style={{ fontSize: "2.2cqw" }}>
                À suivre
              </p>
              <p className="mt-[5cqw] font-display italic leading-none text-gold" style={{ fontSize: "12cqw" }}>
                Prochain numéro
              </p>
              <hr className="mx-auto mt-[6cqw] w-[20cqw] border-0 border-t border-gold/70" />
              <p className="mt-[4cqw] font-display italic text-ink/70" style={{ fontSize: "4.4cqw" }}>
                {identite.email}
              </p>
            </div>
          ) : (
            <>
              <div className="absolute inset-[7cqw]">
                <p className="font-sans uppercase tracking-[0.26em] text-ink/60" style={{ fontSize: "2.2cqw" }}>
                  Ce qu&apos;il y a dans ce numéro
                </p>
                <ol className="mt-[6cqw]">
                  {rubriques.slice(1, 8).map((r) => (
                    <li key={r.id} className="flex items-baseline gap-[2cqw] py-[1.5cqw] font-display italic" style={{ fontSize: "4.6cqw" }}>
                      <span>{r.titre}</span>
                      <span className="flex-1 border-b border-dotted border-gold/70" />
                      <span className="font-sans not-italic tabular-nums text-ink/60" style={{ fontSize: "2.4cqw" }}>
                        {pageLabel(r)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="absolute bottom-[4cqw] right-[7cqw] font-sans uppercase tracking-[0.2em] text-ink/50" style={{ fontSize: "2cqw" }}>
                {identite.magazine} — p. 03
              </p>
            </>
          )}
        </div>

        {/* la couverture, qui pivote autour de la reliure */}
        <div data-s="cover-flip" className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <Couverture titre={fin ? "p" : "h1"} />
          </div>
          {/* dos de la couverture = page de gauche */}
          <div
            className="absolute inset-0 bg-paper text-ink"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", containerType: "inline-size" }}
            aria-hidden="true"
          >
            <div className="absolute inset-[7cqw]">
              <p className="font-sans uppercase tracking-[0.26em] text-ink/60" style={{ fontSize: "2.2cqw" }}>
                {identite.magazine}
              </p>
              <p className="mt-[14cqw] font-display italic leading-none text-gold" style={{ fontSize: fin ? "13cqw" : "16cqw" }}>
                {fin ? "Merci" : "Sommaire"}
              </p>
              <hr className="mt-[6cqw] border-0 border-t border-gold/70" />
              <p className="mt-[4cqw] font-display italic text-ink/70" style={{ fontSize: "4cqw" }}>
                {fin ? "Merci de votre lecture. À très bientôt." : "Six reportages, une interview et quelques surprises."}
              </p>
            </div>
            <p className="absolute bottom-[4cqw] left-[7cqw] font-sans uppercase tracking-[0.2em] text-ink/50" style={{ fontSize: "2cqw" }}>
              p. {pad(fin ? 21 : 2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
