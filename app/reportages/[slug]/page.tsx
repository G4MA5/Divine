import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projetParSlug, projets } from "@/content/projets";
import { identite } from "@/content/identite";
import { DossierContenu } from "@/components/reportages/DossierContenu";
import { TitrePage } from "@/components/reportages/TitrePage";
import { BoutonSon } from "@/components/ui/BoutonSon";
import { PiedDePage } from "@/components/ui/PiedDePage";

export function generateStaticParams() {
  return projets.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/reportages/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = projetParSlug(slug);
  if (!p) return {};
  return {
    title: `${p.titre} — Reportage · ${identite.magazine}`,
    description: `${p.rubrique} : ${p.chapo}`,
    alternates: { canonical: `/reportages/${p.slug}` },
  };
}

export default async function PageReportage(props: PageProps<"/reportages/[slug]">) {
  const { slug } = await props.params;
  const p = projetParSlug(slug);
  if (!p) notFound();

  const i = projets.findIndex((x) => x.slug === p.slug);
  const prec = projets[(i + projets.length - 1) % projets.length];
  const suiv = projets[(i + 1) % projets.length];

  return (
    <>
      <BoutonSon />
      <main className="min-h-svh bg-white pb-10 pl-4 pr-4 pt-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/#reportages" className="btn">
            ← Retour au magazine
          </Link>
          <div className="mt-10">
            <TitrePage>
              <DossierContenu projet={p} numero={i + 1} niveau={1} />
            </TitrePage>
          </div>
          <nav aria-label="Autres reportages" className="mt-16 flex justify-between gap-4 border-t border-ink pt-4">
            <Link href={`/reportages/${prec.slug}`} className="font-display text-lg font-bold italic underline decoration-1 underline-offset-4">
              ← {prec.titre}
            </Link>
            <Link href={`/reportages/${suiv.slug}`} className="text-right font-display text-lg font-bold italic underline decoration-1 underline-offset-4">
              {suiv.titre} →
            </Link>
          </nav>
          <PiedDePage page="08-15" />
        </div>
      </main>
    </>
  );
}
