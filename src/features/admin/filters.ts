import { COUNTRIES, LEAGUES, POSITIONS, PRIORITIES, SEASONS, STATUSES } from "@/lib/constants";
import type { Country, League, PlayerNeedStatus, Position, Priority, Season } from "@/types/domain";

export type AdminNeedFilters = {
  q?: string;
  country?: Country;
  league?: League;
  season?: Season;
  position?: Position;
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
    season: oneOf(input.season, SEASONS) as Season | undefined,
    position: oneOf(input.position, POSITIONS) as Position | undefined,
    status: oneOf(input.status, STATUSES) as PlayerNeedStatus | undefined,
    priority: oneOf(input.priority, PRIORITIES) as Priority | undefined
  };
}

export function filtersToQuery(filters: AdminNeedFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return params.toString();
}
