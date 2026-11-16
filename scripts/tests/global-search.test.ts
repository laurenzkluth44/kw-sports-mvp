// Global search ranking. Run: node --experimental-strip-types scripts/tests/global-search.test.ts
import { filterShortcuts, rankResults, scoreItem, type SearchItem } from "../../src/features/search/model.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };

const items: SearchItem[] = [
  { group: "players", title: "Luca Krist", subtitle: "RL/RM · TSV Bayer Dormagen", href: "/admin/players/1/edit", keywords: "TSV Bayer Dormagen 2. Bundesliga RL RM" },
  { group: "players", title: "Florian Boehnert", subtitle: "RM/RL · TSV Bayer Dormagen", href: "/admin/players/2/edit", keywords: "TSV Bayer Dormagen" },
  { group: "players", title: "Sören Steinhaus", subtitle: "RM/RL · Bergischer HC", href: "/admin/players/3/edit" },
  { group: "needs", title: "HSG Musterstadt · RR", subtitle: "2027/28 · Offen", href: "/admin/needs/9", keywords: "HSG Musterstadt RR 2027/28" },
  { group: "pages", title: "Spielerdatenbank", href: "/admin/players", keywords: "spieler kw" }
];

assert(scoreItem(items[0], "krist") > 0 && scoreItem(items[0], "boehnert") === 0, "name match, no false hit");
assert(scoreItem(items[2], "soren") > 0, "umlauts optional");
assert(scoreItem(items[0], "krist dormagen") > 0 && scoreItem(items[0], "krist kiel") === 0, "every word has to match");

const dormagen = rankResults(items, "dormagen");
assert(dormagen.length === 1 && dormagen[0].items.length === 2, "club name finds both Dormagen players");
assert(rankResults(items, "kri")[0].items[0].title === "Luca Krist", "prefix of the name ranks first");

const spieler = rankResults(items, "spieler");
assert(spieler.some((group) => group.group === "pages"), "pages are found by keyword");

const order = rankResults(items, "rr");
assert(order[0].group === "needs", "need with RR found");

assert(filterShortcuts("rr", "/admin")[0]?.href === "/admin?position=RR", "position shortcut");
assert(filterShortcuts("2027/28", "/agency")[0]?.href === "/agency?season=2027%2F28", "season shortcut");
assert(filterShortcuts("2027-2028", "/admin")[0]?.value === "2027/28", "season written with dash and long year");
assert(filterShortcuts("2027/29", "/admin").length === 0 && filterShortcuts("krist", "/admin").length === 0, "no shortcut for nonsense");
