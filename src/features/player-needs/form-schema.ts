import {
  ATTACK_POSITIONS,
  COACH_ROLES,
  DEFENSE_POSITIONS,
  LANGUAGES,
  LEAGUES,
  NEED_TYPES,
  PLAYER_TYPES,
  PRIORITIES,
  STATUSES,
  TARGET_ROLES,
  isValidSeason
} from "@/lib/constants";
import type { Database } from "@/types/database";
import type { DefensePosition, League, PlayerNeedStatus, Priority, Season } from "@/types/domain";

type PlayerNeedInsert = Database["public"]["Tables"]["player_needs"]["Insert"];
type PlayerNeedUpdate = Database["public"]["Tables"]["player_needs"]["Update"];

export const NEED_FORM_ERRORS = ["save", "positions", "coach_role"] as const;
export type NeedFormErrorCode = (typeof NEED_FORM_ERRORS)[number];

/** Validation failure the form can explain to the user, instead of the generic save error. */
export class NeedFormError extends Error {
  constructor(public code: Exclude<NeedFormErrorCode, "save">) {
    super(code);
  }
}

export function needFormErrorCode(error: unknown): NeedFormErrorCode {
  return error instanceof NeedFormError ? error.code : "save";
}

export function parseNeedFormErrorCode(value: string | undefined): NeedFormErrorCode | null {
  return value && isOneOf(value, NEED_FORM_ERRORS) ? value : null;
}

function isOneOf<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.includes(value);
}

function optionalList<T extends readonly string[]>(formData: FormData, key: string, options: T): T[number][] {
  const values = formData.getAll(key).map((value) => String(value).trim()).filter(Boolean);
  if (!values.every((value) => isOneOf(value, options))) throw new Error(`Invalid ${key}`);
  return options.filter((option) => values.includes(option));
}

function optionalDefensePositions(formData: FormData): DefensePosition[] {
  const values = formData.getAll("defense_positions").map((value) => Number(value));
  if (!values.every((value) => (DEFENSE_POSITIONS as readonly number[]).includes(value))) {
    throw new Error("Invalid defense_positions");
  }
  return DEFENSE_POSITIONS.filter((position) => values.includes(position));
}

function requiredString(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function requiredDateString(formData: FormData, key: string) {
  const value = requiredString(formData, key);
  if (!isValidDateString(value)) throw new Error(`${key} must be a valid YYYY-MM-DD date`);
  return value;
}

function optionalString(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  return value ? value : null;
}

function optionalInteger(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) throw new Error(`${key} must be a number`);
  return parsed;
}

function optionalNumber(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  if (!value) return null;

  const parsed = Number.parseFloat(value.replace(",", "."));
  if (Number.isNaN(parsed)) throw new Error(`${key} must be a number`);
  return parsed;
}

export function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;

  return date.toISOString().slice(0, 10) === value;
}

export function parseClubId(formData: FormData) {
  return requiredString(formData, "club_id");
}

export function parseStatus(formData: FormData): PlayerNeedStatus {
  const status = requiredString(formData, "status");
  if (!isOneOf(status, STATUSES)) throw new Error("Invalid status");
  return status;
}

export function parseNeedFormData(formData: FormData): Omit<PlayerNeedInsert, "club_id"> {
  const season = requiredString(formData, "season");
  const needType = requiredString(formData, "need_type");
  const priority = requiredString(formData, "priority");
  const status = requiredString(formData, "status");
  const neededFromDate = requiredDateString(formData, "needed_from_date");
  const budgetAmount = optionalNumber(formData, "budget_amount");
  const budgetCurrency = optionalString(formData, "budget_currency")?.toUpperCase() || null;

  if (!isValidSeason(season)) throw new Error("Invalid season");
  if (!isOneOf(needType, NEED_TYPES)) throw new Error("Invalid need_type");
  if (!isOneOf(priority, PRIORITIES)) throw new Error("Invalid priority");
  if (!isOneOf(status, STATUSES)) throw new Error("Invalid status");

  // The form keeps player and coach fields in the DOM and only hides one set,
  // so values of the hidden set are dropped here.
  const isCoach = needType === "trainer";
  const coachRole = optionalString(formData, "coach_role");
  const attackPositions = isCoach ? [] : optionalList(formData, "attack_positions", ATTACK_POSITIONS);
  const defensePositions = isCoach ? [] : optionalDefensePositions(formData);

  if (isCoach && (!coachRole || !isOneOf(coachRole, COACH_ROLES))) throw new NeedFormError("coach_role");
  if (!isCoach && attackPositions.length === 0 && defensePositions.length === 0) throw new NeedFormError("positions");

  const payload = {
    season: season as Season,
    need_type: needType,
    attack_positions: attackPositions,
    defense_positions: defensePositions,
    coach_role: isCoach && coachRole && isOneOf(coachRole, COACH_ROLES) ? coachRole : null,
    needed_from_date: neededFromDate,
    priority: priority as Priority,
    status,
    description: optionalString(formData, "description"),
    age_min: isCoach ? null : optionalInteger(formData, "age_min"),
    age_max: isCoach ? null : optionalInteger(formData, "age_max"),
    height_min: isCoach ? null : optionalInteger(formData, "height_min"),
    nationality_preference: optionalString(formData, "nationality_preference"),
    languages: optionalList(formData, "languages", LANGUAGES),
    league_experience: optionalString(formData, "league_experience"),
    player_type: isCoach ? null : optionalString(formData, "player_type"),
    player_types: isCoach ? [] : optionalList(formData, "player_types", PLAYER_TYPES),
    target_roles: isCoach ? [] : optionalList(formData, "target_roles", TARGET_ROLES),
    contract_status_preference: optionalString(formData, "contract_status_preference"),
    budget_amount: budgetAmount,
    budget_currency: budgetAmount === null ? null : budgetCurrency || "EUR",
    budget_note: optionalString(formData, "budget_note"),
    status_note: optionalString(formData, "status_note")
  };

  if (payload.age_min !== null && payload.age_max !== null && payload.age_min > payload.age_max) {
    throw new Error("Invalid age range");
  }

  return payload;
}

export function parseConfidentialNote(formData: FormData) {
  return optionalString(formData, "confidential_note");
}

export function parseLeagueFilter(value: string | undefined) {
  if (!value) return undefined;
  return isOneOf(value, LEAGUES) ? (value as League) : undefined;
}

export type PlayerNeedFormPayload = Omit<PlayerNeedInsert, "club_id">;
export type PlayerNeedUpdatePayload = PlayerNeedUpdate;
