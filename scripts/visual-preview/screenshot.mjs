// Takes screenshots of the CI-only preview pages (see scripts/visual-preview/page.tsx).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
const out = process.env.OUT_DIR || "screenshots";
mkdirSync(out, { recursive: true });

const shots = [
  { name: "squad-attack-desktop", path: "/visual-preview/squad", width: 1280 },
  { name: "squad-defense-desktop", path: "/visual-preview/squad?view=defense", width: 1280 },
  { name: "squad-attack-en-desktop", path: "/visual-preview/squad?lang=en", width: 1280 },
  { name: "squad-attack-mobile", path: "/visual-preview/squad", width: 390 },
  { name: "squad-empty-desktop", path: "/visual-preview/empty", width: 1280 },
  { name: "player-form-desktop", path: "/visual-preview/form", width: 1280 },
  { name: "player-form-mobile", path: "/visual-preview/form", width: 390 },
  { name: "needs-admin-desktop", path: "/visual-preview/needs", width: 1280 },
  { name: "needs-admin-position-rr", path: "/visual-preview/needs?position=RR", width: 1280 },
  { name: "needs-admin-list", path: "/visual-preview/needs?view=list", width: 1280 },
  { name: "needs-agency-en-mobile", path: "/visual-preview/agency?lang=en", width: 390 },
  { name: "need-form-desktop", path: "/visual-preview/need-form", width: 1280, steps: 4 },
  { name: "need-form-mobile", path: "/visual-preview/need-form", width: 390 },
  { name: "not-found-desktop", path: "/diese-seite-gibt-es-nicht", width: 1280, expectStatus: 404 },
  { name: "error-desktop", path: "/visual-preview/error", width: 1280 },
  { name: "mobile-menu-open", path: "/visual-preview/squad", width: 390, click: "header summary", fullPage: false },
  { name: "login-desktop", path: "/login", width: 1280 },
  { name: "login-desktop-error", path: "/login?error=invalid", width: 1440 },
  { name: "login-mobile", path: "/login", width: 390 },
  { name: "kw-players-desktop", path: "/visual-preview/players", width: 1280 },
  { name: "kw-player-form-desktop", path: "/visual-preview/player-form", width: 1280 },
  { name: "kw-matches-desktop", path: "/visual-preview/matches", width: 1280 },
  { name: "kw-matches-mobile", path: "/visual-preview/matches", width: 390 },
  { name: "club-suggestions-desktop", path: "/visual-preview/suggestions", width: 1280 },
  { name: "club-suggestions-mobile", path: "/visual-preview/suggestions?lang=en", width: 390 },
  { name: "admin-inbox-desktop", path: "/visual-preview/inbox", width: 1280 },
  { name: "admin-inbox-waiting", path: "/visual-preview/inbox?tab=wartet", width: 1280 },
  { name: "email-suggestion", path: "/visual-preview/email?kind=suggestion", width: 680 },
  { name: "email-suggestion-fr-mobile", path: "/visual-preview/email?kind=suggestion-fr", width: 390 },
  { name: "email-new-need", path: "/visual-preview/email?kind=need", width: 680 },
  { name: "email-answer", path: "/visual-preview/email?kind=answer", width: 680 },
  { name: "email-reminder", path: "/visual-preview/email?kind=reminder", width: 680 }
];

const browser = await chromium.launch();
for (const shot of shots) {
  const page = await browser.newPage({ viewport: { width: shot.width, height: 900 }, deviceScaleFactor: 1 });
  const response = await page.goto(base + shot.path, { waitUntil: "networkidle" });
  if (!response || (response.status() >= 400 && response.status() !== shot.expectStatus)) {
    console.error(`::error::${shot.path} returned ${response?.status()}`);
    process.exitCode = 1;
  }
  if (shot.click) {
    await page.locator(shot.click).first().click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `${out}/${shot.name}.png`, fullPage: shot.fullPage ?? true });
  console.log(`captured ${shot.name}`);
  // Multi-step forms: click through the step tabs and capture each step.
  for (let step = 2; step <= (shot.steps ?? 0); step += 1) {
    await page.locator("nav[aria-label^='Schritt'] button").nth(step - 1).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${shot.name}-step${step}.png`, fullPage: true });
    console.log(`captured ${shot.name}-step${step}`);
  }
  await page.close();
}
await browser.close();
