// Player name search. Run: node --experimental-strip-types scripts/tests/search.test.ts
import { matchesPlayerSearch } from "../../src/features/kw-players/search-text.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };
const krist = { first_name: "Luca", last_name: "Krist", current_club: "TSV Bayer Dormagen" };
const soren = { first_name: "Sören", last_name: "Steinhaus", current_club: "Bergischer HC" };
const domantas = { first_name: "Domantas", last_name: "Jonušauskas", current_club: "Ahlener SG" };

assert(matchesPlayerSearch(krist, "kri"), "part of the last name");
assert(matchesPlayerSearch(krist, "Luca Krist") && matchesPlayerSearch(krist, "krist luca"), "full name in any order");
assert(matchesPlayerSearch(krist, "dormagen") && matchesPlayerSearch(krist, "krist dorm"), "club and name + club");
assert(matchesPlayerSearch(soren, "soren") && matchesPlayerSearch(soren, "Sören"), "umlauts optional");
assert(matchesPlayerSearch(domantas, "jonusauskas"), "accents optional");
assert(!matchesPlayerSearch(krist, "boehnert"), "no false hits");
assert(matchesPlayerSearch(krist, "  "), "empty search shows everyone");
