// KW player season statistics. Run: node --experimental-strip-types scripts/tests/stats.test.ts
import { headlineLine, seasonLines, seasonOf } from "../../src/features/kw-players/stats-model.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };
const row = (o: Record<string, unknown>) => ({ competition: "2. HBL", game_date: "2026-10-17", games: 1, goals: null, shots: null, assists: null, turnovers: null, two_min: null, hpi: null, saves: null, goals_against: null, ...o }) as never;

assert(seasonOf("2026-10-17") === "2026/27" && seasonOf("2027-03-01") === "2026/27" && seasonOf("2026-06-30") === "2025/26", "season runs July to June");

const krist = [
  row({ game_date: "2026-09-30", games: 6, goals: 30, shots: 50, assists: 40, turnovers: 12, hpi: 7.0, game: "Saison bis 30.09." }),
  row({ game_date: "2026-10-10", goals: 5, shots: 8, assists: 9, turnovers: 2, hpi: 8.4 }),
  row({ game_date: "2026-10-17", goals: 3, shots: 7, assists: 12, turnovers: 4, hpi: 8.8 }),
  row({ competition: "DHB-Pokal", game_date: "2026-10-01", goals: 4, shots: 5 }),
  row({ game_date: "2026-04-01", goals: 9, shots: 10 })
];
const line = headlineLine(krist)!;
assert(line.season === "2026/27" && line.competition === "2. HBL", "headline is this season's league, not the cup or last season");
assert(line.games === 8 && line.goals === 38 && line.shots === 65 && line.shotPct === 58, "summary row and single games add up (8 games, 38/65, 58 %)");
assert(line.assists === 61 && line.turnovers === 18, "assists and turnovers add up");
assert(line.hpi === 7.4, "HPI is weighted by games: (6×7.0 + 8.4 + 8.8) / 8 = 7.4");
assert(seasonLines(krist).length === 3, "one line per season and competition");

const goalsOnly = headlineLine([row({ competition: "3. Liga", goals: 6 }), row({ competition: "3. Liga", game_date: "2026-10-24", goals: 4 })])!;
assert(goalsOnly.goals === 10 && goalsOnly.shots === null && goalsOnly.shotPct === null && goalsOnly.hpi === null, "3. Liga: goals only, no made-up rates");

const keeper = headlineLine([row({ saves: 10, goals_against: 25 }), row({ game_date: "2026-10-24", saves: 14, goals_against: 26 })])!;
assert(keeper.saves === 24 && keeper.savePct === 32, "goalkeeper save rate 24/(24+51) = 32 %");
assert(headlineLine([]) === null, "no games, no line");
