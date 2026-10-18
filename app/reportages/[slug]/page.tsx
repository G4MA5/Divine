import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projetParSlug, projets } from "@/content/projets";
import { identite } from "@/content/identite";
import { ReportageContenu } from "@/components/reportages/ReportageContenu";
import { OuvertureAuto } from "@/components/reportages/OuvertureAuto";
import { BoutonSon } from "@/components/ui/BoutonSon";
import { BoutonTheme } from "@/components/ui/BoutonTheme";
import { PiedDePage } from "@/components/ui/PiedDePage";

export function generateStaticParams() {
  return projets.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/reportages/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = projetParSlug(slug);
  if (!p) return {};
  const description = `${p.rubrique} : ${p.chapo}`.replace(/\[À FOURNIR[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  return {
    title: `${p.titre} — Reportage · ${identite.magazine}`,
    description: description || `Reportage sur ${p.titre}, un projet de Divine Graourou.`,
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
      <OuvertureAuto type={p.ouverture} />
      <BoutonTheme />
      <BoutonSon />
      <main className="mx-auto min-h-svh max-w-3xl pb-10 pl-4 pr-10 pt-20 sm:px-8">
        <Link href="/#reportages" className="label inline-block border border-accent/60 px-3 py-2 transition-colors hover:bg-bg-deep">
          ← Retour au magazine
        </Link>
        <div className="mt-8">
          <ReportageContenu projet={p} niveau={1} />
        </div>
        <nav aria-label="Autres reportages" className="mt-14 flex justify-between gap-4 border-t border-accent/50 pt-4">
          <Link href={`/reportages/${prec.slug}`} className="font-display italic transition-colors hover:text-accent">
            ← {prec.titre}
          </Link>
          <Link href={`/reportages/${suiv.slug}`} className="text-right font-display italic transition-colors hover:text-accent">
            {suiv.titre} →
          </Link>
        </nav>
        <PiedDePage page="08-15" />
      </main>
    </>
  );
}
