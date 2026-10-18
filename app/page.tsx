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
import { Interview } from "@/components/rubriques/Interview";
import { Quatrieme } from "@/components/rubriques/Quatrieme";
import { identite } from "@/content/identite";
import { SITE_URL } from "@/lib/site";
import { PortraitProvider } from "@/components/PortraitContext";
import { portraitExiste } from "@/lib/portrait";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BoutonSon } from "@/components/ui/BoutonSon";
import { BoutonTheme } from "@/components/ui/BoutonTheme";
import { BoutonSommaire } from "@/components/ui/BoutonSommaire";
import { MarquePage } from "@/components/ui/MarquePage";
import { IndicateurPage } from "@/components/ui/IndicateurPage";

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
    <PortraitProvider disponible={portraitExiste()}>
    <IntroGate>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }} />
      <SmoothScroll />
      <BoutonSommaire />
      <BoutonTheme />
      <BoutonSon />
      <MarquePage />
      <IndicateurPage />
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
        <Interview />
        <Quatrieme />
      </main>
    </IntroGate>
    </PortraitProvider>
  );
}
