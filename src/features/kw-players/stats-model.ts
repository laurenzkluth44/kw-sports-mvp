/**
 * Season statistics of KW players, added up from game rows (kw_player_games).
 * Pure functions: used by the player card, the admin page and the unit tests.
 */
type GameRow = {
  competition: string;
  game_date: string;
  games: number;
  goals: number | null;
  shots: number | null;
  assists: number | null;
  turnovers: number | null;
  two_min: number | null;
  hpi: number | null;
  saves: number | null;
  goals_against: number | null;
};

export type SeasonLine = {
  season: string;
  competition: string;
  games: number;
  goals: number | null;
  shots: number | null;
  /** Goals per shot in %, only when every counted game has shots recorded. */
  shotPct: number | null;
  assists: number | null;
  turnovers: number | null;
  twoMin: number | null;
  /** Average HPI over the games that have one. */
  hpi: number | null;
  saves: number | null;
  goalsAgainst: number | null;
  /** Saves / (saves + goals against) in %. */
  savePct: number | null;
  lastGame: string;
};

/** Handball seasons run July to June: 2026-10-17 → "2026/27". */
export function seasonOf(date: string) {
  const [year, month] = date.split("-").map(Number);
  const start = month >= 7 ? year : year - 1;
  return `${start}/${String((start + 1) % 100).padStart(2, "0")}`;
}

/** Sum of a field, or null when no row has it (so "not recorded" stays different from 0). */
function sum(rows: GameRow[], key: keyof GameRow) {
  const values = rows.map((row) => row[key]).filter((value): value is number => typeof value === "number");
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
}

export function seasonLines(rows: GameRow[]): SeasonLine[] {
  const groups = new Map<string, GameRow[]>();
  rows.forEach((row) => {
    const key = `${seasonOf(row.game_date)}|${row.competition}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });

  return [...groups.entries()]
    .map(([key, group]) => {
      const [season, competition] = key.split("|");
      const games = group.reduce((total, row) => total + row.games, 0);
      const goals = sum(group, "goals");
      const shots = sum(group, "shots");
      const allShots = group.every((row) => row.goals === null || row.shots !== null);
      const hpiRows = group.filter((row) => row.hpi !== null);
      const hpiGames = hpiRows.reduce((total, row) => total + row.games, 0);
      const saves = sum(group, "saves");
      const goalsAgainst = sum(group, "goals_against");
      return {
        season,
        competition,
        games,
        goals,
        shots,
        shotPct: goals !== null && shots && allShots ? Math.round((goals / shots) * 100) : null,
        assists: sum(group, "assists"),
        turnovers: sum(group, "turnovers"),
        twoMin: sum(group, "two_min"),
        hpi: hpiGames ? Math.round((hpiRows.reduce((total, row) => total + Number(row.hpi) * row.games, 0) / hpiGames) * 10) / 10 : null,
        saves,
        goalsAgainst,
        savePct: saves !== null && goalsAgainst !== null && saves + goalsAgainst > 0 ? Math.round((saves / (saves + goalsAgainst)) * 100) : null,
        lastGame: group.map((row) => row.game_date).sort().at(-1)!
      };
    })
    .sort((a, b) => b.season.localeCompare(a.season) || b.games - a.games);
}

/**
 * The line shown on the card: the newest season, and in it the competition with the most games
 * (the league, not a cup). An older season only if nothing was played this season yet.
 */
export function headlineLine(rows: GameRow[]): SeasonLine | null {
  return seasonLines(rows)[0] ?? null;
}
