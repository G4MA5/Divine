import { AmbientLight, DirectionalLight, NoToneMapping, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { creerPersonnage, HAUTEUR_PERSO, type IdPerso } from "./Personnage";

/**
 * Des images fixes des personnages 3D (pour les cartes de l'écran d'accueil) : un seul rendu hors écran par personnage,
 * transparent, puis le contexte WebGL est libéré. Le résultat est gardé en mémoire.
 */
let cache: Promise<Record<IdPerso, string>> | null = null;

const IDS: IdPerso[] = ["recruteur", "curieuse", "client", "etudiante", "divine"];

export function capturerPersonnages(): Promise<Record<IdPerso, string>> {
  if (cache) return cache;
  cache = new Promise((resolve, reject) => {
    try {
      const H = 460;
      const W = 300;
      const renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1);
      renderer.setSize(W, H, false);
      renderer.toneMapping = NoToneMapping;
      renderer.setClearColor(0x000000, 0);
      const scene = new Scene();
      scene.add(new AmbientLight(0xffffff, 2.1));
      const soleil = new DirectionalLight(0xffffff, 1.3);
      soleil.position.set(-3, 6, 8);
      scene.add(soleil);
      const cam = new PerspectiveCamera(30, W / H, 0.1, 60);
      cam.position.set(0, 0.35, 8.6);
      cam.lookAt(0, 0.3, 0);
      const sortie = {} as Record<IdPerso, string>;
      IDS.forEach((id) => {
        const p = creerPersonnage(id);
        p.racine.rotation.y = 0.38;
        p.racine.position.y = -HAUTEUR_PERSO / 2 + 0.05;
        scene.add(p.racine);
        renderer.render(scene, cam);
        sortie[id] = renderer.domElement.toDataURL("image/png");
        scene.remove(p.racine);
        p.liberer();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      resolve(sortie);
    } catch (e) {
      cache = null;
      reject(e);
    }
  });
  return cache;
}
