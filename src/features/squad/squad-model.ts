import { ATTACK_POSITIONS, DEFENSE_POSITIONS, seasonEndDate, seasonForDate, seasonLabel, seasonStartYear } from "@/lib/constants";
import type { AttackPosition, DefensePosition, RosterPlayer } from "@/types/domain";

/**
 * Squad logic, kept free of UI so it is easy to reason about:
 * a player counts for a season if their contract runs at least until that season's
 * last day (30 June). Coverage per position:
 *   gap  = nobody can play it
 *   thin = only one main player, or only players who list it as a secondary position
 *   ok   = two or more main players
 */
export type CoverageStatus = "gap" | "thin" | "ok";

export type SlotCoverage = {
  main: RosterPlayer[];
  secondary: RosterPlayer[];
  status: CoverageStatus;
};

// Court order: goalkeeper, then left to right, pivot last.
export const COURT_ORDER: readonly AttackPosition[] = ["TW", "LA", "RL", "RM", "RR", "RA", "KM"];

export function coverageStatus(mainCount: number, secondaryCount: number): CoverageStatus {
  if (mainCount + secondaryCount === 0) return "gap";
  if (mainCount >= 2) return "ok";
  return "thin";
}

export function currentSeason(today = new Date()) {
  return seasonForDate(today);
}

/** Seasons shown on the board: the current one and the next `ahead` seasons. */
export function planningSeasons(ahead = 2, today = new Date()) {
  const start = seasonStartYear(currentSeason(today));
  return Array.from({ length: ahead + 1 }, (_, index) => seasonLabel(start + index));
}

/** Seasons a contract can run until, for the player form. */
export function contractSeasons(extra?: string | null, today = new Date()) {
  const start = seasonStartYear(currentSeason(today));
  const seasons = Array.from({ length: 7 }, (_, index) => seasonLabel(start + index));
  if (extra && !seasons.includes(extra)) seasons.unshift(extra);
  return seasons.sort();
}

/** Season whose last day is the contract end, e.g. 2028-06-30 -> "2027/28". */
export function seasonOfContractEnd(contractUntil: string) {
  const date = new Date(`${contractUntil}T00:00:00.000Z`);
  return seasonForDate(date);
}

export function isUnderContract(player: RosterPlayer, season: string) {
  return player.contract_until >= seasonEndDate(season);
}

export function playersForSeason(players: RosterPlayer[], season: string) {
  return players.filter((player) => isUnderContract(player, season));
}

export type ContractState = "expired" | "expiring" | "running";

/** expiring = ends at the end of the current season; expired = already over. */
export function contractState(player: RosterPlayer, today = new Date()): ContractState {
  const todayIso = today.toISOString().slice(0, 10);
  if (player.contract_until < todayIso) return "expired";
  if (player.contract_until <= seasonEndDate(currentSeason(today))) return "expiring";
  return "running";
}

export function byJerseyThenName(a: RosterPlayer, b: RosterPlayer) {
  const jerseyA = a.jersey_number ?? 1000;
  const jerseyB = b.jersey_number ?? 1000;
  if (jerseyA !== jerseyB) return jerseyA - jerseyB;
  return a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name);
}

export function attackCoverage(players: RosterPlayer[]): Record<AttackPosition, SlotCoverage> {
  return Object.fromEntries(
    ATTACK_POSITIONS.map((position) => {
      const main = players.filter((player) => player.position === position).sort(byJerseyThenName);
      const secondary = players
        .filter((player) => player.position !== position && player.secondary_positions.includes(position))
        .sort(byJerseyThenName);
      return [position, { main, secondary, status: coverageStatus(main.length, secondary.length) }];
    })
  ) as Record<AttackPosition, SlotCoverage>;
}

/** Defense slots have no main/secondary split: everyone who can defend there counts. */
export function defenseCoverage(players: RosterPlayer[]): Record<DefensePosition, SlotCoverage> {
  return Object.fromEntries(
    DEFENSE_POSITIONS.map((position) => {
      const main = players.filter((player) => player.defense_positions.includes(position)).sort(byJerseyThenName);
      const slot: SlotCoverage = { main, secondary: [], status: coverageStatus(main.length, 0) };
      return [position, slot];
    })
  ) as unknown as Record<DefensePosition, SlotCoverage>;
}

export function attackGaps(players: RosterPlayer[], season: string) {
  const coverage = attackCoverage(playersForSeason(players, season));
  return COURT_ORDER.filter((position) => coverage[position].status !== "ok").map((position) => ({
    position,
    ...coverage[position]
  }));
}

export function shortName(player: RosterPlayer) {
  return player.last_name || player.first_name;
}
