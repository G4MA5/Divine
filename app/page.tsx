import { IntroGate } from "@/components/intro/IntroGate";
import { SceneTable } from "@/components/intro/SceneTable";
import { Sommaire } from "@/components/rubriques/Sommaire";
import { Edito } from "@/components/rubriques/Edito";
import { Parcours } from "@/components/rubriques/Parcours";
import { Experience } from "@/components/rubriques/Experience";
import { Reportages } from "@/components/rubriques/Reportages";
import { Competences } from "@/components/rubriques/Competences";
import { Atouts } from "@/components/rubriques/Atouts";
import { Recette } from "@/components/rubriques/Recette";
import { Peinture } from "@/components/rubriques/Peinture";
import { Pied } from "@/components/rubriques/Pied";
import { Interview } from "@/components/rubriques/Interview";
import { Quatrieme } from "@/components/rubriques/Quatrieme";
import { identite } from "@/content/identite";
import { SITE_URL } from "@/lib/site";
import { PortraitProvider } from "@/components/PortraitContext";
import { portraitExiste, cvExiste } from "@/lib/portrait";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BoutonSon } from "@/components/ui/BoutonSon";
import { BoutonSommaire } from "@/components/ui/BoutonSommaire";
import { CurseurLueur } from "@/components/ui/CurseurLueur";
import { IndicateurPage } from "@/components/ui/IndicateurPage";
import { Filigranes, NavFlottante, Aimants } from "@/components/ui/Effets";

const donneesStructurees = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: identite.nom,
  givenName: identite.prenom,
  jobTitle: identite.titre,
  email: `mailto:${identite.email}`,
  url: SITE_URL,
  address: { "@type": "PostalAddress", addressLocality: "Abidjan", addressCountry: "CI" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Université Polytechnique de Bingerville" },
};

export default function Accueil() {
  return (
    <PortraitProvider disponible={portraitExiste()} cv={cvExiste()}>
    <IntroGate>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }} />
      <SmoothScroll />
      <BoutonSommaire />
      <BoutonSon />
      <IndicateurPage />
      <NavFlottante />
      <Aimants />
      <CurseurLueur />
      <main>
        <SceneTable />
        <Sommaire />
        <Edito />
        <Parcours />
        <Experience />
        <Reportages />
        <Competences />
        <Atouts />
        <Recette />
        <Peinture />
        <Interview />
        <Quatrieme />
        <Pied />
      </main>
      <Filigranes />
    </IntroGate>
    </PortraitProvider>
  );
}
