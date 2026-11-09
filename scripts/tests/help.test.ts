// Checks the help guides. Run: node --experimental-strip-types scripts/tests/help.test.ts
import { existsSync } from "node:fs";
import { adminGuideDe } from "../../src/features/help/admin-de.ts";
import { agencyGuideDe, agencyGuideEn } from "../../src/features/help/agency.ts";
import { clubGuideDe } from "../../src/features/help/club-de.ts";
import { clubGuideEn } from "../../src/features/help/club-en.ts";
import { clubGuideEs } from "../../src/features/help/club-es.ts";
import { clubGuideFr } from "../../src/features/help/club-fr.ts";
import { splitStep } from "../../src/features/help/text.ts";
import type { HelpGuide } from "../../src/features/help/types.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };

const ids = (guide: HelpGuide) => guide.sections.flatMap((s) => s.topics.map((t) => `${s.id}/${t.id}${t.quickstart ? "*" : ""}${t.shot ? `@${t.shot}` : ""}`)).join(",");
const texts = (guide: HelpGuide) => guide.sections.flatMap((s) => s.topics.flatMap((t) => [t.title, t.goal, t.tip ?? "", ...t.steps]));

for (const [name, guide] of Object.entries({ en: clubGuideEn, fr: clubGuideFr, es: clubGuideEs })) {
  assert(ids(guide) === ids(clubGuideDe), `club guide ${name} has the same topics, quickstart marks and screenshots as de`);
}
assert(ids(agencyGuideEn) === ids(agencyGuideDe), "agency guide en matches de");

const all = { clubGuideDe, clubGuideEn, clubGuideFr, clubGuideEs, agencyGuideDe, agencyGuideEn, adminGuideDe };
for (const [name, guide] of Object.entries(all)) {
  const bad = texts(guide).filter((t) => (t.match(/\[\[/g) ?? []).length !== (t.match(/\]\]/g) ?? []).length);
  assert(bad.length === 0, `${name}: every [[label]] is closed${bad.length ? ` (${bad[0]})` : ""}`);
  assert(guide.sections.every((s) => s.topics.every((t) => t.steps.length > 0)), `${name}: every topic has steps`);
}

const parts = splitStep("Klicke auf [[Kader]], dann [[Spieler hinzufügen]].");
assert(parts.length === 5 && parts[1].chip && parts[1].text === "Kader" && !parts[4].chip, "splitStep finds the UI labels");

const shots = new Set(Object.values(all).flatMap((g) => g.sections.flatMap((s) => s.topics.map((t) => t.shot).filter(Boolean))));
const file: Record<string, string> = { needForm: "need-form", adminNeeds: "admin-needs", bulkUpload: "bulk-upload", goLive: "go-live" };
for (const shot of shots) assert(existsSync(`public/help/${file[shot!] ?? shot}.jpg`), `screenshot for ${shot} exists`);
