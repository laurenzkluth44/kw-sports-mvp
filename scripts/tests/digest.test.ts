// Weekly agency digest. Run: node --experimental-strip-types scripts/tests/digest.test.ts
import { digestLocale, digestNeeds } from "../../src/lib/email/digest.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };
const now = new Date("2026-11-16T07:00:00Z");
const need = (id: string, o: Record<string, unknown>) => ({ id, status: "offen", need_type: "spieler", created_at: "2026-11-12T10:00:00Z", attack_positions: ["RR"], priority: "mittel", ...o });
const list = [
  need("old", { created_at: "2026-11-01T10:00:00Z" }),
  need("filled", { status: "besetzt" }),
  need("coach", { need_type: "trainer", attack_positions: [] }),
  need("rr-low", { priority: "niedrig" }),
  need("rr-high", { priority: "hoch" }),
  need("la", { attack_positions: ["LA"] }),
  need("talks", { status: "in_gespraechen", attack_positions: ["KM"] })
];
const ids = digestNeeds(list, now).map((n) => n.id).join(",");
assert(ids === "la,rr-high,rr-low,talks,coach", `last 7 days, still open, by court position then priority (${ids})`);
assert(digestNeeds([need("x", { created_at: "2026-11-09T07:00:00Z" })], now).length === 1, "exactly 7 days ago still counts");
assert(digestLocale("max@agentur.de") === "de" && digestLocale("info@agency.dk") === "en" && digestLocale("a@b.ch ") === "de", "German for .de/.at/.ch, otherwise English");
