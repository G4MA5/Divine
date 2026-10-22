import Image from "next/image";
import type { Projet } from "@/content/projets";

/**
 * Les images réelles du projet. Sans capture, trois cadres vides (une fenêtre de navigateur, ou un téléphone pour une
 * application mobile) attendent les images : aucun texte, juste la forme. Dès que `captures` est renseigné, elles s'affichent.
 */
export function Apercus({ projet }: { projet: Projet }) {
  const mobile = projet.format === "mobile";
  const images = projet.captures ?? [];
  const n = images.length || 3;
  const cadres = Array.from({ length: n }, (_, i) => images[i] ?? null);

  return (
    <section aria-label={`Aperçu de ${projet.titre}`} className="mt-10">
      <p className="label">Aperçu</p>
      <ul className={`mt-3 grid gap-4 ${mobile ? "grid-cols-3 sm:max-w-xl" : "sm:grid-cols-2"}`}>
        {cadres.map((src, i) => (
          <li key={i} className={mobile ? "" : i === 0 && cadres.length % 2 === 1 ? "sm:col-span-2" : ""}>
            {mobile ? <Telephone src={src} alt={`${projet.titre}, écran ${i + 1}`} /> : <Fenetre src={src} alt={`${projet.titre}, capture ${i + 1}`} />}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Fenetre({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink/20 bg-white">
      <div className="flex items-center gap-1.5 border-b border-ink/15 bg-[#f4f2ec] px-3 py-2" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-ink/25" />
        <span className="h-2 w-2 rounded-full bg-ink/25" />
        <span className="h-2 w-2 rounded-full bg-ink/25" />
        <span className="ml-2 h-2.5 w-1/3 rounded-full bg-ink/10" />
      </div>
      <div className="relative aspect-[16/10] w-full bg-[#faf9f6]">
        {src ? (
          <Image src={src} alt={alt} fill sizes="(max-width: 640px) 90vw, 480px" className="object-cover object-top" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid grid-rows-[auto_1fr] gap-2 p-3">
            <span className="h-3 w-1/2 rounded bg-ink/[0.07]" />
            <span className="grid grid-cols-3 gap-2">
              <span className="col-span-2 rounded bg-ink/[0.05]" />
              <span className="rounded bg-ink/[0.07]" />
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

function Telephone({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="rounded-[1.6rem] border-2 border-ink/80 bg-ink p-1.5">
      <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[1.2rem] bg-[#faf9f6]">
        {src ? (
          <Image src={src} alt={alt} fill sizes="(max-width: 640px) 30vw, 160px" className="object-cover object-top" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid grid-rows-[auto_auto_1fr] gap-2 p-2.5 pt-5">
            <span className="mx-auto h-1.5 w-1/3 rounded-full bg-ink/15" />
            <span className="h-3 w-2/3 rounded bg-ink/[0.07]" />
            <span className="rounded bg-ink/[0.05]" />
          </span>
        )}
      </div>
    </div>
  );
}
