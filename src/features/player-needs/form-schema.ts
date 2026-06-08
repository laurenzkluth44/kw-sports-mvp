import { LEAGUES, POSITIONS, PRIORITIES, SEASONS, STATUSES } from "@/lib/constants";
import type { Database } from "@/types/database";
import type { League, PlayerNeedStatus, Position, Priority, Season } from "@/types/domain";

type PlayerNeedInsert = Database["public"]["Tables"]["player_needs"]["Insert"];
type PlayerNeedUpdate = Database["public"]["Tables"]["player_needs"]["Update"];

function isOneOf<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.includes(value);
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
  const position = requiredString(formData, "position");
  const priority = requiredString(formData, "priority");
  const status = requiredString(formData, "status");
  const neededFromDate = requiredDateString(formData, "needed_from_date");
  const budgetAmount = optionalNumber(formData, "budget_amount");
  const budgetCurrency = optionalString(formData, "budget_currency")?.toUpperCase() || null;

  if (!isOneOf(season, SEASONS)) throw new Error("Invalid season");
  if (!isOneOf(position, POSITIONS)) throw new Error("Invalid position");
  if (!isOneOf(priority, PRIORITIES)) throw new Error("Invalid priority");
  if (!isOneOf(status, STATUSES)) throw new Error("Invalid status");

  const payload = {
    season: season as Season,
    position: position as Position,
    needed_from_date: neededFromDate,
    priority: priority as Priority,
    status,
    description: optionalString(formData, "description"),
    age_min: optionalInteger(formData, "age_min"),
    age_max: optionalInteger(formData, "age_max"),
    height_min: optionalInteger(formData, "height_min"),
    nationality_preference: optionalString(formData, "nationality_preference"),
    league_experience: optionalString(formData, "league_experience"),
    player_type: optionalString(formData, "player_type"),
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

export function parseLeagueFilter(value: string | undefined) {
  if (!value) return undefined;
  return isOneOf(value, LEAGUES) ? (value as League) : undefined;
}

export type PlayerNeedFormPayload = Omit<PlayerNeedInsert, "club_id">;
export type PlayerNeedUpdatePayload = PlayerNeedUpdate;
