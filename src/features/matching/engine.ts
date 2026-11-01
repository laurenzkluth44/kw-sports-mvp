import type { KwPlayer, MatchReason, PlayerNeed } from "@/types/domain";

/**
 * Matching engine: how well does a KW player fit a club need?
 *
 * Must fit (otherwise the player is not suggested at all):
 *   - player need: at least one wanted attack or defence position
 *   - coach need:  the wanted coach role
 * Scored (each with a weight; criteria the club left empty are skipped, so the
 * score is "share of the club's criteria the player meets"):
 *   availability 30 · age 15 · height 10 · languages 10 · player type 10 · league experience 10
 *   plus the position itself 15 (always met when suggested).
 * Unknown player data (e.g. no birth date) counts half and shows as "?".
 */
export type MatchResult = {
  eligible: boolean;
  score: number;
  reasons: MatchReason[];
};

const WEIGHTS = {
  position: 15,
  coach_role: 15,
  availability: 30,
  age: 15,
  height: 10,
  languages: 10,
  player_types: 10,
  league: 10
} as const;

function ageAt(birthDate: string, onDate: string) {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const on = new Date(`${onDate}T00:00:00Z`);
  let age = on.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    on.getUTCMonth() < birth.getUTCMonth() ||
    (on.getUTCMonth() === birth.getUTCMonth() && on.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function monthYear(date: string) {
  return `${date.slice(5, 7)}/${date.slice(0, 4)}`;
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9äöüåæøé]+/g, " ").trim();
}

export function scorePlayerForNeed(
  need: Pick<
    PlayerNeed,
    | "need_type"
    | "attack_positions"
    | "defense_positions"
    | "coach_role"
    | "needed_from_date"
    | "age_min"
    | "age_max"
    | "height_min"
    | "languages"
    | "player_types"
    | "league_experience"
  >,
  player: KwPlayer
): MatchResult {
  const reasons: MatchReason[] = [];
  let earned = 0;
  let possible = 0;

  function add(key: MatchReason["key"], ok: boolean | null, value?: string) {
    const weight = WEIGHTS[key];
    possible += weight;
    earned += ok === true ? weight : ok === null ? weight / 2 : 0;
    reasons.push(value === undefined ? { key, ok } : { key, ok, value });
  }

  if (player.kind !== need.need_type) return { eligible: false, score: 0, reasons: [] };

  // Must fit
  if (need.need_type === "trainer") {
    if (!need.coach_role || !player.coach_roles.includes(need.coach_role)) return { eligible: false, score: 0, reasons: [] };
    add("coach_role", true, need.coach_role);
  } else {
    const attack = need.attack_positions.filter((position) => player.attack_positions.includes(position));
    const defense = need.defense_positions.filter((position) => player.defense_positions.includes(position));
    if (attack.length === 0 && defense.length === 0) return { eligible: false, score: 0, reasons: [] };
    add("position", true, [...attack, ...defense.map((position) => `A${position}`)].join(" · "));
  }

  // Availability: free by the date the club needs the player
  const neededFrom = need.needed_from_date;
  // value: "from:MM/YYYY" (available from) or "until:MM/YYYY" (contract runs until)
  if (player.available_from) {
    add("availability", player.available_from <= neededFrom, `from:${monthYear(player.available_from)}`);
  } else if (player.contract_until) {
    add("availability", player.contract_until < neededFrom, `until:${monthYear(player.contract_until)}`);
  } else {
    add("availability", null);
  }

  if (need.need_type === "spieler") {
    if (need.age_min !== null || need.age_max !== null) {
      if (player.birth_date) {
        const age = ageAt(player.birth_date, neededFrom);
        const ok = (need.age_min === null || age >= need.age_min) && (need.age_max === null || age <= need.age_max);
        add("age", ok, String(age));
      } else {
        add("age", null);
      }
    }

    if (need.height_min !== null) {
      add("height", player.height_cm === null ? null : player.height_cm >= need.height_min, player.height_cm === null ? undefined : String(player.height_cm));
    }

    if (need.player_types.length > 0) {
      const shared = need.player_types.filter((type) => player.player_types.includes(type));
      add("player_types", player.player_types.length === 0 ? null : shared.length > 0, shared.join(","));
    }
  }

  if (need.languages.length > 0) {
    const shared = need.languages.filter((language) => player.languages.includes(language));
    add("languages", player.languages.length === 0 ? null : shared.length > 0, shared.join(","));
  }

  if (need.league_experience) {
    const wanted = normalize(need.league_experience);
    const has = [player.league_experience, player.current_league].filter(Boolean).map((text) => normalize(text!));
    const ok = has.length === 0 ? null : has.some((text) => text.includes(wanted) || wanted.includes(text));
    add("league", ok, need.league_experience);
  }

  const score = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  return { eligible: true, score, reasons };
}

/** All eligible players for a need, best first. */
export function rankPlayersForNeed(need: Parameters<typeof scorePlayerForNeed>[0], players: KwPlayer[]) {
  return players
    .map((player) => ({ player, ...scorePlayerForNeed(need, player) }))
    .filter((result) => result.eligible)
    .sort((a, b) => b.score - a.score || a.player.last_name.localeCompare(b.player.last_name));
}

export function playerAge(player: Pick<KwPlayer, "birth_date">, today = new Date()) {
  return player.birth_date ? ageAt(player.birth_date, today.toISOString().slice(0, 10)) : null;
}
