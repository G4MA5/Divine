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

for (const scheme of ["light", "dark"] as const) {
  test(`rien ne déborde à l'horizontale, mode ${scheme}`, async ({ page }, info) => {
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
  const etat = () => page.locator("[data-s=mag-pos]").first().evaluate((el) => (el as HTMLElement).style.transform);
  await defiler(page, 0);
  await page.waitForTimeout(900);
  const depart = await etat();
  await defiler(page, page.viewportSize()!.height * 3.4);
  await page.waitForTimeout(900);
  const milieu = await etat();
  expect(milieu).not.toBe(depart);
  await defiler(page, 0);
  await page.waitForTimeout(1200);
  expect(await etat()).toBe(depart);
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
  await expect(page.getByRole("link", { name: "Lire le reportage →" })).toHaveCount(projets.length);
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
