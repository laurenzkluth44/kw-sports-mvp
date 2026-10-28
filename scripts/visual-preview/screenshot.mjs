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
  { name: "player-form-mobile", path: "/visual-preview/form", width: 390 }
];

const browser = await chromium.launch();
for (const shot of shots) {
  const page = await browser.newPage({ viewport: { width: shot.width, height: 900 }, deviceScaleFactor: 1 });
  const response = await page.goto(base + shot.path, { waitUntil: "networkidle" });
  if (!response || response.status() >= 400) {
    console.error(`::error::${shot.path} returned ${response?.status()}`);
    process.exitCode = 1;
  }
  await page.screenshot({ path: `${out}/${shot.name}.png`, fullPage: true });
  console.log(`captured ${shot.name}`);
  await page.close();
}
await browser.close();
