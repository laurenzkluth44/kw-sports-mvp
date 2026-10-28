import type { DefenseGroup, DefensePosition } from "@/types/domain";

export const LEAGUES = [
  "1. Bundesliga",
  "2. Bundesliga",
  "3. Liga",
  "3. Liga Nord-West",
  "3. Liga Nord-Ost",
  "3. Liga Süd-West",
  "3. Liga Süd",
  "Starligue",
  "Håndboldligaen",
  "Liga ASOBAL",
  "Quickline Handball League",
  "Andere"
] as const;

export const COUNTRIES = ["Deutschland", "Frankreich", "Dänemark", "Spanien", "Schweiz"] as const;

// Seasons run 1 July – 30 June and are stored as "2026/27". There is no fixed list any more:
// the app offers a rolling window around the current season.
const SEASON_PATTERN = /^(\d{4})\/(\d{2})$/;

export function isValidSeason(value: string): boolean {
  const match = SEASON_PATTERN.exec(value);
  if (!match) return false;
  return Number(match[2]) === (Number(match[1]) + 1) % 100;
}

export function seasonLabel(startYear: number) {
  return `${startYear}/${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export function seasonStartYear(season: string) {
  return Number(season.slice(0, 4));
}

/** Season a date falls into; seasons switch on 1 July. */
export function seasonForDate(date = new Date()) {
  const year = date.getUTCFullYear();
  return seasonLabel(date.getUTCMonth() >= 6 ? year : year - 1);
}

/** Last day of a season, e.g. "2026/27" -> "2027-06-30". */
export function seasonEndDate(season: string) {
  return `${seasonStartYear(season) + 1}-06-30`;
}

/** First day of a season, e.g. "2026/27" -> "2026-07-01". */
export function seasonStartDate(season: string) {
  return `${seasonStartYear(season)}-07-01`;
}

/** Rolling window of seasons: `before` seasons back to `after` seasons ahead of the current one. */
export function seasonWindow(before = 1, after = 3, today = new Date()) {
  const current = seasonStartYear(seasonForDate(today));
  return Array.from({ length: before + after + 1 }, (_, index) => seasonLabel(current - before + index));
}

/** Season options for a select, always including `extra` values (e.g. a stored older season). */
export function seasonOptions(extra: (string | null | undefined)[] = []) {
  const values = new Set(seasonWindow());
  extra.forEach((season) => {
    if (season && isValidSeason(season)) values.add(season);
  });
  return [...values].sort();
}

export const SEASONS: readonly string[] = seasonWindow();

export const NEED_TYPES = ["spieler", "trainer"] as const;

export const ATTACK_POSITIONS = ["TW", "LA", "RL", "RM", "RR", "RA", "KM"] as const;

// Abwehr 6:0 von außen nach außen: 1/6 Außen, 2/5 Halb, 3/4 Innenblock.
export const DEFENSE_POSITIONS = [1, 2, 3, 4, 5, 6] as const;

export const DEFENSE_GROUPS = ["aussen", "halb", "innen"] as const;

export const DEFENSE_GROUP_POSITIONS = {
  aussen: [1, 6],
  halb: [2, 5],
  innen: [3, 4]
} as const;

export function defenseGroupOf(position: DefensePosition): DefenseGroup {
  if (position === 1 || position === 6) return "aussen";
  if (position === 2 || position === 5) return "halb";
  return "innen";
}

export const COACH_ROLES = ["cheftrainer", "co_trainer", "torwarttrainer", "athletiktrainer", "jugendtrainer"] as const;

export const PLAYER_TYPES = ["eins_gegen_eins", "spielstark", "wurfstark", "abwehrstark"] as const;

export const TARGET_ROLES = ["fuehrungsrolle", "stammspieler", "rotationsspieler", "perspektivspieler"] as const;

// ISO 639-1; Anzeigenamen kommen lokalisiert aus Intl.DisplayNames.
export const LANGUAGES = ["de", "en", "fr", "es", "da", "sv", "no", "nl", "pl", "hr", "sr", "sl", "hu", "pt", "is"] as const;

export const LEAGUE_EXPERIENCE_SUGGESTIONS = [
  ...LEAGUES.filter((league) => league !== "Andere"),
  "EHF Champions League",
  "EHF European League"
] as const;

export const PRIORITIES = ["hoch", "mittel", "niedrig"] as const;

export const STATUSES = [
  "offen",
  "in_gespraechen",
  "besetzt",
  "archiviert"
] as const;

export const ROLE_LABELS = {
  admin: "KW Sports Admin",
  club: "Club User",
  agency: "Agency User"
} as const;

export const PRIORITY_LABELS = {
  hoch: "Hoch",
  mittel: "Mittel",
  niedrig: "Niedrig"
} as const;

export const STATUS_LABELS = {
  offen: "Offen",
  in_gespraechen: "In Gesprächen",
  besetzt: "Besetzt",
  archiviert: "Archiviert"
} as const;

export const STATUS_BADGE_CLASSES = {
  offen: "border-brand-100 bg-brand-100 text-brand-700",
  in_gespraechen: "border-brand-100 bg-brand-100 text-brand-700",
  besetzt: "border-navy-100 bg-navy-100 text-navy-700",
  archiviert: "border-slate-200 bg-slate-100 text-slate-600"
} as const;

export const PRIORITY_BADGE_CLASSES = {
  hoch: "border-red-100 bg-red-50 text-red-700",
  mittel: "border-brand-100 bg-brand-100 text-brand-700",
  niedrig: "border-slate-200 bg-slate-100 text-slate-600"
} as const;
