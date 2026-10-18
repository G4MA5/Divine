import { IntroGate } from "@/components/intro/IntroGate";
import { SceneTable } from "@/components/intro/SceneTable";
import { Sommaire } from "@/components/rubriques/Sommaire";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BoutonSon } from "@/components/ui/BoutonSon";
import { BoutonTheme } from "@/components/ui/BoutonTheme";
import { BoutonSommaire } from "@/components/ui/BoutonSommaire";
import { MarquePage } from "@/components/ui/MarquePage";
import { IndicateurPage } from "@/components/ui/IndicateurPage";

export default function Accueil() {
  return (
    <IntroGate>
      <SmoothScroll />
      <BoutonSommaire />
      <BoutonTheme />
      <BoutonSon />
      <MarquePage />
      <IndicateurPage />
      <main>
        <SceneTable />
        <Sommaire />
      </main>
    </IntroGate>
  );
}
