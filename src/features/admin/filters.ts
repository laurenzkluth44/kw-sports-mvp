import {
  ATTACK_POSITIONS,
  COUNTRIES,
  DEFENSE_GROUPS,
  DEFENSE_GROUP_POSITIONS,
  LEAGUES,
  NEED_TYPES,
  PRIORITIES,
  STATUSES,
  isValidSeason
} from "@/lib/constants";
import type {
  AttackPosition,
  Country,
  DefenseGroup,
  League,
  NeedType,
  PlayerNeedStatus,
  Priority,
  Season
} from "@/types/domain";

export type AdminNeedFilters = {
  q?: string;
  country?: Country;
  league?: League;
  season?: Season;
  type?: NeedType;
  position?: AttackPosition;
  defense?: DefenseGroup;
  status?: PlayerNeedStatus;
  priority?: Priority;
};

function oneOf<T extends readonly string[]>(value: string | undefined, options: T): T[number] | undefined {
  if (!value) return undefined;
  return (options as readonly string[]).includes(value) ? (value as T[number]) : undefined;
}

export function normalizeAdminNeedFilters(input: Record<string, string | undefined>): AdminNeedFilters {
  const q = input.q?.trim();

  return {
    q: q || undefined,
    country: oneOf(input.country, COUNTRIES) as Country | undefined,
    league: oneOf(input.league, LEAGUES) as League | undefined,
    season: input.season && isValidSeason(input.season) ? (input.season as Season) : undefined,
    type: oneOf(input.type, NEED_TYPES) as NeedType | undefined,
    position: oneOf(input.position, ATTACK_POSITIONS) as AttackPosition | undefined,
    defense: oneOf(input.defense, DEFENSE_GROUPS) as DefenseGroup | undefined,
    status: oneOf(input.status, STATUSES) as PlayerNeedStatus | undefined,
    priority: oneOf(input.priority, PRIORITIES) as Priority | undefined
  };
}

type NeedFilterQuery<Q> = {
  ilike(column: string, pattern: string): Q;
  eq(column: string, value: string): Q;
  contains(column: string, value: string[]): Q;
  overlaps(column: string, value: number[]): Q;
};

/** Applies the shared admin/agency need filters to a player_needs query joined with clubs!inner. */
export function applyNeedFilters<Q extends NeedFilterQuery<Q>>(query: Q, filters: AdminNeedFilters): Q {
  let next = query;

  if (filters.q) next = next.ilike("clubs.name", `%${filters.q}%`);
  if (filters.country) next = next.eq("clubs.country", filters.country);
  if (filters.league) next = next.eq("clubs.league", filters.league);
  if (filters.season) next = next.eq("season", filters.season);
  if (filters.type) next = next.eq("need_type", filters.type);
  if (filters.position) next = next.contains("attack_positions", [filters.position]);
  if (filters.defense) next = next.overlaps("defense_positions", [...DEFENSE_GROUP_POSITIONS[filters.defense]]);
  if (filters.status) next = next.eq("status", filters.status);
  if (filters.priority) next = next.eq("priority", filters.priority);

  return next;
}

export function filtersToQuery(filters: AdminNeedFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return params.toString();
}
