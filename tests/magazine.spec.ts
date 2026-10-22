import { expect, test, type Page } from "@playwright/test";
import { projets } from "../content/projets";

type Lenis = { scrollTo: (y: number, o?: object) => void };

/** Écran d'accueil : « En silence » puis « Surprenez-moi ». */
async function entrer(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "En silence" }).click();
  await page.getByRole("button", { name: "Surprenez-moi" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

const defiler = (page: Page, y: number) =>
  page.evaluate(async (top) => {
    const l = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (l) l.scrollTo(top, { immediate: true });
    else window.scrollTo(0, top);
    await new Promise((r) => setTimeout(r, 450));
  }, y);

for (const scheme of ["light"] as const) {
  test(`rien ne déborde à l'horizontale (fond blanc fixe)`, async ({ page }, info) => {
    await page.emulateMedia({ colorScheme: scheme });
    await entrer(page);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const h = page.viewportSize()!.height;
    const pas = Math.round(h * 1.1);
    for (let y = 0; y < total; y += pas) {
      await defiler(page, y);
      const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      expect(sw, `débordement à y=${y}`).toBeLessThanOrEqual(iw + 1);
    }
    await page.screenshot({ path: `test-results/${info.project.name}-fin-${scheme}.png` });
  });
}

test("le scroll arrière rembobine la scène de la table", async ({ page }) => {
  await entrer(page);
  // GSAP écrit parfois « translate3d(0px, 0px, 0px) » en plus : c'est le même état, on le neutralise
  const etat = () => page.locator("[data-s=mag-pos]").first().evaluate((el) => (el as HTMLElement).style.transform.replace(/\s*translate3d\(0px, 0px, 0px\)/g, "").trim());
  await defiler(page, 0);
  await page.waitForTimeout(900);
  const depart = await etat();
  await defiler(page, page.viewportSize()!.height * 3.4);
  await page.waitForTimeout(900);
  const milieu = await etat();
  expect(milieu).not.toBe(depart);
  await defiler(page, 0);
  // le scrub lisse le mouvement : on laisse le temps à la scène de revenir à son point de départ
  await expect.poll(etat, { timeout: 10_000 }).toBe(depart);
});

test("le son reste coupé : aucun contexte audio n'est créé sans action explicite", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __ctx: number }).__ctx = 0;
    const Orig = window.AudioContext;
    window.AudioContext = class extends Orig {
      constructor(...a: ConstructorParameters<typeof AudioContext>) {
        super(...a);
        (window as unknown as { __ctx: number }).__ctx++;
      }
    } as typeof AudioContext;
  });
  await entrer(page);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 1400) await defiler(page, y);
  expect(await page.evaluate(() => (window as unknown as { __ctx: number }).__ctx)).toBe(0);
});

test("« Passer l'intro » mène au sommaire", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Passer l'intro" }).click();
  await expect(page.getByRole("heading", { name: "Sommaire" }).first()).toBeInViewport();
});

test("navigation au clavier : le focus est visible dès l'écran d'accueil", async ({ page }) => {
  await page.goto("/");
  // l'écran de chargement (le petit personnage) passe d'abord
  await page.locator('[aria-label="Chargement du magazine"]').waitFor({ state: "detached", timeout: 15_000 });
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { tag: el.tagName, outline: cs.outlineStyle, w: cs.outlineWidth, inDialog: !!el.closest("[role=dialog]") };
  });
  expect(focus?.tag).toBe("BUTTON");
  expect(focus?.outline).not.toBe("none");
  // Entrée valide un choix
  await page.keyboard.press("Enter");
  await expect(page.getByText("Qui êtes-vous ?")).toBeVisible();
});

test("mouvement réduit : pas de scène ni de sections épinglées, contenu accessible", async ({ browser }, info) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: info.project.use.viewport ?? undefined, isMobile: info.project.use.isMobile });
  const page = await ctx.newPage();
  await entrer(page);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Sommaire" }).first()).toBeInViewport();
  await expect(page.getByRole("button", { name: /Ouvrir le dossier/ })).toHaveCount(projets.length);
  await ctx.close();
});

for (const p of projets) {
  test(`le reportage « ${p.titre} » s'ouvre par son URL directe`, async ({ page }) => {
    const r = await page.goto(`/reportages/${p.slug}`);
    expect(r?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: p.titre })).toBeVisible({ timeout: 15_000 });
    expect(await page.title()).toContain(p.titre);
  });
}

test("une seule balise h1 sur l'accueil et textes alternatifs présents", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator("h1").count()).toBe(1);
  const sansAlt = await page.evaluate(() => [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length);
  expect(sansAlt).toBe(0);
});

test("le contenu textuel de l'interview complète est dans le HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("Pourquoi le backend ?");
  expect(html).toContain("Tennis ou code");
});

test("aucun « À FOURNIR » n'est visible sur le site", async ({ request }) => {
  for (const url of ["/", "/reportages/canopee", "/reportages/metro"]) {
    const html = await (await request.get(url)).text();
    expect(html, url).not.toContain("À FOURNIR");
  }
});

test("la couverture d'un dossier s'ouvre en iris et se referme avec Échap", async ({ page }) => {
  await entrer(page);
  await page.locator("#reportages").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Ouvrir le dossier Canopée/ }).click();
  const dossier = page.getByRole("dialog", { name: /Dossier Canopée/ });
  await expect(dossier).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dossier).toHaveCount(0, { timeout: 5000 });
});

test("le bouton Sommaire ouvre le menu (Staggered Menu) et mène à la rubrique choisie", async ({ page }) => {
  await entrer(page);
  const bouton = page.getByRole("button", { name: /Open menu/i });
  await bouton.click();
  await expect(page.locator(".sm-panel-item").first()).toBeVisible();
  await page.locator(".sm-panel-item", { hasText: "Parcours" }).click();
  await expect(page.locator("#parcours")).toBeInViewport({ timeout: 8000 });
  // le panneau est refermé : ses liens ne sont plus atteignables au clavier
  await expect(page.locator("#staggered-menu-panel")).toHaveAttribute("inert", "");
});

test("la messagerie pose ses questions une à une puis propose le Sling Button", async ({ page }) => {
  await entrer(page);
  await page.locator("#quatrieme").scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const l = (window as unknown as { __lenis?: Lenis }).__lenis;
    const y = document.querySelector("#quatrieme")!.getBoundingClientRect().top + scrollY + 300;
    l?.scrollTo(y, { immediate: true });
  });
  const champ = page.locator("#reponse-contact");
  const repondre = async (v: string) => {
    await expect(champ).toBeEnabled({ timeout: 15_000 });
    await champ.fill(v);
    await champ.press("Enter");
  };
  await repondre("Awa");
  await repondre("Un projet de site");
  await expect(champ).toBeEnabled({ timeout: 15_000 });
  await champ.fill("pas un mail");
  await champ.press("Enter");
  await expect(page.locator("#erreur-contact")).toContainText("e-mail");
  await repondre("awa@exemple.com");
  await repondre("");
  await expect(page.getByRole("button", { name: "Envoyer le message" })).toBeVisible({ timeout: 15_000 });
});

test("les mots de l'Édito sont séparés par des espaces", async ({ page }) => {
  await page.goto("/");
  const texte = await page.locator("#edito [data-texte]").first().innerText();
  expect(texte).toMatch(/\w+ \w+ \w+/);
  expect(texte).not.toMatch(/[a-zé]{18,}/i);
});

test("les cartes d'expérience s'empilent et portent un logo ou un monogramme", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#experience article")).toHaveCount(4);
  await expect(page.locator("#experience img")).not.toHaveCount(0);
});

test("la galerie affiche les Bounce Cards et la visionneuse s'ouvre", async ({ page }) => {
  await entrer(page);
  await page.locator("#peinture").scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const l = (window as unknown as { __lenis?: Lenis }).__lenis;
    const y = document.querySelector("#peinture")!.getBoundingClientRect().top + scrollY + 330;
    l?.scrollTo(y, { immediate: true });
  });
  const cartes = page.locator("#peinture [role=button]");
  await expect(cartes).toHaveCount(6, { timeout: 8000 });
  // BounceCards écoute le pointeur sur toute la zone : on clique au centre de la 3e carte
  const boite = (await cartes.nth(2).boundingBox())!;
  await page.mouse.move(boite.x + boite.width / 2, boite.y + boite.height / 2);
  await page.mouse.click(boite.x + boite.width / 2, boite.y + boite.height / 2);
  await expect(page.getByRole("dialog", { name: /Tableau n°/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Tableau n°/ })).toHaveCount(0);
});

test("le survol d'une ligne du Sommaire fait apparaître la bande dorée (Flowing Menu)", async ({ page, isMobile }) => {
  test.skip(!!isMobile, "le survol n'existe pas au toucher");
  await entrer(page);
  await page.evaluate(() => {
    const l = (window as unknown as { __lenis?: Lenis }).__lenis;
    const y = document.querySelector("#sommaire")!.getBoundingClientRect().top + scrollY + 300;
    l?.scrollTo(y, { immediate: true });
  });
  const menu = page.locator('nav[aria-label="Sommaire du magazine"]');
  await expect(menu).toBeVisible();
  const ligne = (await menu.locator("li").nth(3).boundingBox())!;
  for (let i = 0; i < 10; i++) {
    await page.mouse.move(ligne.x + 200 + i * 20, ligne.y + ligne.height / 2);
    await page.waitForTimeout(40);
  }
  await expect
    .poll(() => menu.evaluate((n) => [...n.querySelectorAll("li > div")].filter((d) => getComputedStyle(d).visibility === "visible").length), { timeout: 5000 })
    .toBeGreaterThan(0);
});

test("un clic loin dans le Sommaire passe par le rideau et arrive sur la bonne page", async ({ page }) => {
  await entrer(page);
  await page.evaluate(() => {
    const l = (window as unknown as { __lenis?: Lenis }).__lenis;
    l?.scrollTo(document.documentElement.scrollHeight, { immediate: true });
  });
  await page.waitForTimeout(800);
  await page.getByRole("link", { name: "Peinture" }).first().click();
  await expect.poll(() => page.evaluate(() => Math.round(document.getElementById("peinture")!.getBoundingClientRect().top)), { timeout: 10_000 }).toBeLessThanOrEqual(2);
  // le rideau est retiré
  await expect(page.locator('[class*="z-[96]"]')).toHaveCount(0);
});

test("le parcours est une scène épinglée : la commande git et l'étape changent avec le scroll", async ({ page }) => {
  await entrer(page);
  const aller = (dy: number) =>
    page.evaluate(async (d) => {
      const l = (window as unknown as { __lenis?: Lenis }).__lenis;
      const y = document.querySelector("#parcours")!.getBoundingClientRect().top + scrollY + d;
      l?.scrollTo(y, { immediate: true });
      await new Promise((r) => setTimeout(r, 1500));
    }, dy);
  await aller(300);
  const cmd = page.locator("[data-vy-cmd]");
  await expect(cmd).toContainText("git checkout");
  await aller(page.viewportSize()!.height * 2.6);
  await expect(cmd).toContainText(/git s/, { timeout: 10_000 }); // « git switch … » : la frappe suit le scroll avec un léger retard
});

test("le livre est rendu en 3D (un canvas WebGL) tout en gardant le titre h1 accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#scene canvas")).toHaveCount(1, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});
