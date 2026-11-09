// Builds the "Erste Schritte" PDFs for clubs from the help content (topics marked quickstart).
// Run: FONT_DIR=<folder with Bebas.ttf, Outfit-400/600/700.ttf> node --experimental-strip-types scripts/help/quickstart-pdf.ts
// Needs Playwright with Chromium. Without FONT_DIR the fonts are loaded from Google Fonts.
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { clubGuideDe } from "../../src/features/help/club-de.ts";
import { clubGuideEn } from "../../src/features/help/club-en.ts";
import { splitStep } from "../../src/features/help/text.ts";
import type { HelpGuide } from "../../src/features/help/types.ts";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const SITE = process.env.HELP_SITE ?? "kw-sports-mvp.vercel.app";

const variants = [
  {
    guide: clubGuideDe,
    lang: "de",
    file: "public/help/KW-Club-Hub_Erste-Schritte.pdf",
    eyebrow: "Erste Schritte",
    title: "KW Club Hub für Vereine",
    lead: "Die wichtigsten Schritte auf einen Blick. Grau hinterlegte Begriffe sind Buttons und Felder, so wie sie auf dem Bildschirm stehen.",
    tip: "Tipp",
    more: `Ausführliche Anleitung mit Bildern: nach dem Login oben auf „Hilfe“ (${SITE}/help).`
  },
  {
    guide: clubGuideEn,
    lang: "en",
    file: "public/help/KW-Club-Hub_Getting-Started.pdf",
    eyebrow: "Getting started",
    title: "KW Club Hub for clubs",
    lead: "The key steps at a glance. Highlighted terms are buttons and fields, exactly as they appear on screen.",
    tip: "Tip",
    more: `Full guide with pictures: after signing in, click “Help” at the top (${SITE}/help).`
  }
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rich = (s: string) => splitStep(s).map((p) => (p.chip ? `<span class="chip">${esc(p.text)}</span>` : esc(p.text))).join("");

function fontFaces() {
  const dir = process.env.FONT_DIR;
  if (!dir || !existsSync(join(dir, "Bebas.ttf"))) {
    return `@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700&display=swap");`;
  }
  const face = (family: string, file: string, weight: number) =>
    `@font-face{font-family:"${family}";src:url(data:font/ttf;base64,${readFileSync(join(dir, file)).toString("base64")}) format("truetype");font-weight:${weight};}`;
  return [face("Bebas Neue", "Bebas.ttf", 400), face("Outfit", "Outfit-400.ttf", 400), face("Outfit", "Outfit-600.ttf", 600), face("Outfit", "Outfit-700.ttf", 700)].join("\n");
}

function html(v: (typeof variants)[number]) {
  const guide: HelpGuide = v.guide;
  const logo = readFileSync("public/kw-sports-logo-white.svg").toString("base64");
  // One continuous two-column flow keeps it to two pages without orphaned section headings.
  const topics = guide.sections.flatMap((section) => section.topics.filter((t) => t.quickstart));
  const body = topics
    .map(
      (t, i) => `<article>
        <h3><span class="num">${String(i + 1).padStart(2, "0")}</span>${esc(t.title)}</h3>
        <p class="goal">${esc(t.goal)}</p>
        <ol>${t.steps.map((s) => `<li>${rich(s)}</li>`).join("")}</ol>
        ${t.tip ? `<p class="tip"><b>${v.tip}:</b> ${rich(t.tip)}</p>` : ""}
      </article>`
    )
    .join("");

  return `<!doctype html><html lang="${v.lang}"><head><meta charset="utf-8"><style>
${fontFaces()}
@page{size:A4;margin:12mm 0 11mm}
@page:first{margin-top:0}
*{box-sizing:border-box}
body{margin:0;font-family:Outfit,sans-serif;color:#1f2937;font-size:8.6pt;line-height:1.45}
.hero{background:#0a0a0a;color:#fff;padding:13mm 14mm 9mm;border-bottom:3px solid #0055ff}
.hero img{height:5.2mm}
.eyebrow{margin:8mm 0 2mm;font-weight:700;font-size:7.5pt;letter-spacing:.2em;text-transform:uppercase;color:#7aa8ff}
.eyebrow:before{content:"";display:inline-block;width:7mm;height:2px;background:#0055ff;vertical-align:middle;margin-right:2.5mm}
h1{margin:0;font-family:"Bebas Neue";font-weight:400;font-size:38pt;line-height:.95;letter-spacing:.01em;text-transform:uppercase}
.lead{margin:3mm 0 0;max-width:150mm;color:#cbd5e1;font-size:9pt}
main{padding:7mm 14mm 0}
.cols{column-count:2;column-gap:7mm}
article{break-inside:avoid;border-left:2px solid #0055ff;padding:.5mm 0 .5mm 3.5mm;margin:0 0 4.5mm}
h3{margin:0;font-family:"Bebas Neue";font-weight:400;font-size:12.5pt;line-height:1.05;color:#0a0a0a;text-transform:uppercase;letter-spacing:.02em}
.num{display:inline-block;background:#0055ff;color:#fff;padding:0 1.4mm;margin-right:2mm;font-size:10pt}
.goal{margin:.8mm 0 1.5mm;color:#6b7280;font-size:8pt}
ol{margin:0;padding-left:4.2mm}
li{margin:0 0 .9mm;padding-left:.5mm}
li::marker{font-weight:700;color:#0055ff}
.chip{display:inline;border:1px solid #d1d5db;background:#f8fafc;padding:0 .8mm;box-decoration-break:clone;-webkit-box-decoration-break:clone;font-weight:700;font-size:7.2pt;letter-spacing:.04em;text-transform:uppercase;color:#0a0a0a;line-height:1.35}
.tip{margin:1.5mm 0 0;background:#eef4ff;padding:1.4mm 2mm;color:#0a0a0a;font-size:7.8pt}
.more{margin:6mm 0 0;padding-top:3mm;border-top:1px solid #e5e7eb;color:#374151;font-weight:600}
.foot{color:#9ca3af;font-size:7pt;margin-top:1mm}
</style></head><body>
<div class="hero">
  <img src="data:image/svg+xml;base64,${logo}" alt="KW Sports">
  <p class="eyebrow">${esc(v.eyebrow)}</p>
  <h1>${esc(v.title)}</h1>
  <p class="lead">${esc(v.lead)}</p>
</div>
<main><div class="cols">${body}</div>
  <p class="more">${esc(v.more)}</p>
  <p class="foot">KW Sports GmbH · kwsports.de</p>
</main>
</body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage();
for (const v of variants) {
  await page.setContent(html(v), { waitUntil: "networkidle" });
  await page.pdf({ path: v.file, format: "A4", printBackground: true });
  console.log("wrote", v.file);
}
await browser.close();
