// Profile completeness. Run: node --experimental-strip-types scripts/tests/completeness.test.ts
import { profileCompleteness } from "../../src/features/kw-players/completeness.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };
const full = {
  kind: "spieler" as const, photo_path: "p.jpg", cv_path: "cv.pdf", birth_date: "2005-03-16", nationality: "Deutschland", height_cm: 192,
  handedness: "rechts", attack_positions: ["RL", "RM"], defense_positions: [2, 3], player_types: ["eins_gegen_eins"], languages: ["de", "en"],
  league_experience: "2. Bundesliga", contract_until: "2027-06-30", profile: "Spielmacher", video_url: "https://drive.google.com/x"
};

assert(profileCompleteness(full).percent === 100 && profileCompleteness(full).missing.length === 0, "complete profile = 100 %");
const gaps = profileCompleteness({ ...full, video_url: null, languages: [], profile: "  " });
assert(gaps.missing.join(",") === "Sprachen,Profiltext,Video" && gaps.percent === 79, "three gaps of 14 = 79 %, empty text counts as missing");
const keeper = profileCompleteness({ ...full, attack_positions: ["TW"], handedness: null, defense_positions: [], player_types: [] });
assert(keeper.percent === 100 && keeper.total === 11, "goalkeeper needs no hand, defence or type");
const coach = profileCompleteness({ ...full, kind: "trainer", coach_roles: ["cheftrainer"], height_cm: null, video_url: null });
assert(coach.percent === 100 && coach.total === 9, "coach has its own list");
