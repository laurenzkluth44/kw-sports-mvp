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
  { name: "squad-import-desktop", path: "/visual-preview/import", width: 1280 },
  { name: "squad-import-preview-desktop", path: "/visual-preview/import-preview", width: 1280 },
  { name: "squad-import-preview-mobile", path: "/visual-preview/import-preview", width: 390 },
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
  { name: "go-live-desktop", path: "/visual-preview/go-live", width: 1280 },
  { name: "needs-agency-desktop", path: "/visual-preview/agency", width: 1280 },
  { name: "help-club-desktop", path: "/visual-preview/help", width: 1280 },
  { name: "help-club-fr-mobile", path: "/visual-preview/help?lang=fr", width: 390 },
  { name: "help-admin-desktop", path: "/visual-preview/help?guide=admin", width: 1280 },
  { name: "help-agency-en-desktop", path: "/visual-preview/help?guide=agency&lang=en", width: 1280 },
  { name: "help-menu-mobile", path: "/visual-preview/help", width: 390, click: "header summary", fullPage: false },
  { name: "go-live-mobile", path: "/visual-preview/go-live", width: 390 },
  { name: "bulk-upload-empty", path: "/visual-preview/bulk-upload", width: 1280 },
  { name: "bulk-upload-desktop", path: "/visual-preview/bulk-upload", width: 1280, files: ["20261027_KW_CV_Jonas_Brenner_DE.pdf", "20261027_KW_CV_Jonas_Brenner_EN.pdf", "athlete-mats-lindgren.jpg", "Haddad.png", "20260721_KW_CV_Tom_Weber.docx", "scan_0042.pdf"] },
  { name: "bulk-upload-mobile", path: "/visual-preview/bulk-upload", width: 390, files: ["20261027_KW_CV_Jonas_Brenner_DE.pdf", "20261027_KW_CV_Jonas_Brenner_EN.pdf", "athlete-mats-lindgren.jpg", "Haddad.png", "20260721_KW_CV_Tom_Weber.docx", "scan_0042.pdf"] },
  { name: "kw-player-form-desktop", path: "/visual-preview/player-form", width: 1280 },
  { name: "kw-matches-desktop", path: "/visual-preview/matches", width: 1280 },
  { name: "kw-matches-mobile", path: "/visual-preview/matches", width: 390 },
  { name: "club-suggestions-desktop", path: "/visual-preview/suggestions", width: 1280 },
  { name: "club-suggestions-mobile", path: "/visual-preview/suggestions?lang=en", width: 390 },
  { name: "need-detail-desktop", path: "/visual-preview/need-detail", width: 1280 },
  { name: "need-detail-mobile", path: "/visual-preview/need-detail", width: 390 },
  { name: "club-cockpit-desktop", path: "/visual-preview/cockpit", width: 1280 },
  { name: "club-cockpit-mobile", path: "/visual-preview/cockpit?lang=en", width: 390 },
  { name: "club-cockpit-empty", path: "/visual-preview/cockpit-empty", width: 1280 },
  { name: "crests-desktop", path: "/visual-preview/crests", width: 1280 },
  { name: "crests-mobile", path: "/visual-preview/crests", width: 390 },
  { name: "club-need-desktop", path: "/visual-preview/club-need", width: 1280 },
  { name: "club-need-mobile", path: "/visual-preview/club-need?lang=en", width: 390 },
  { name: "club-need-filled-choice", path: "/visual-preview/club-need", width: 1280, click: "[role=group] details summary" },
  { name: "club-need-filled", path: "/visual-preview/club-need-filled", width: 1280 },
  { name: "admin-inbox-desktop", path: "/visual-preview/inbox", width: 1280 },
  { name: "admin-inbox-waiting", path: "/visual-preview/inbox?tab=wartet", width: 1280 },
  { name: "email-suggestion", path: "/visual-preview/email?kind=suggestion", width: 680 },
  { name: "email-suggestion-fr-mobile", path: "/visual-preview/email?kind=suggestion-fr", width: 390 },
  { name: "email-new-need", path: "/visual-preview/email?kind=need", width: 680 },
  { name: "email-answer", path: "/visual-preview/email?kind=answer", width: 680 },
  { name: "email-reminder", path: "/visual-preview/email?kind=reminder", width: 680 },
  { name: "email-invite", path: "/visual-preview/email?kind=invite", width: 680 },
  { name: "email-reset", path: "/visual-preview/email?kind=reset", width: 680 },
  { name: "auth-set-password", path: "/set-password", width: 1280 },
  { name: "auth-set-password-mobile", path: "/set-password", width: 390 },
  { name: "auth-forgot-password", path: "/forgot-password?sent=1", width: 1280 },
  { name: "auth-confirm-invite", path: "/auth/confirm?token_hash=preview&type=invite&next=/set-password", width: 1280 }
];

const browser = await chromium.launch();
for (const shot of shots) {
  const page = await browser.newPage({ viewport: { width: shot.width, height: 900 }, deviceScaleFactor: 1 });
  const response = await page.goto(base + shot.path, { waitUntil: "networkidle" });
  if (!response || (response.status() >= 400 && response.status() !== shot.expectStatus)) {
    console.error(`::error::${shot.path} returned ${response?.status()}`);
    process.exitCode = 1;
  }
  if (shot.files) {
    // Bulk upload: feed dummy files into the file input, the page assigns them by name.
    const mime = { pdf: "application/pdf", jpg: "image/jpeg", png: "image/png", docx: "application/octet-stream" };
    await page.locator("input[type=file]").setInputFiles(
      shot.files.map((name) => ({ name, mimeType: mime[name.split(".").pop()], buffer: Buffer.alloc(180_000 + name.length * 9_000) }))
    );
    await page.waitForTimeout(300);
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
