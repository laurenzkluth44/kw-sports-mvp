import type { COUNTRIES, LEAGUES, POSITIONS, PRIORITIES, SEASONS, STATUSES } from "@/lib/constants";

export type AppRole = "admin" | "club";
export type Country = (typeof COUNTRIES)[number];
export type League = (typeof LEAGUES)[number];
export type Season = (typeof SEASONS)[number];
export type Position = (typeof POSITIONS)[number];
export type Priority = (typeof PRIORITIES)[number];
export type PlayerNeedStatus = (typeof STATUSES)[number];

export type Club = {
  id: string;
  name: string;
  country: string;
  league: League;
  city: string;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  club_id: string | null;
  name: string;
  email: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
  clubs?: Club | null;
};

export type PlayerNeed = {
  id: string;
  club_id: string;
  season: Season;
  position: Position;
  needed_from_date: string;
  priority: Priority;
  status: PlayerNeedStatus;
  description: string | null;
  age_min: number | null;
  age_max: number | null;
  height_min: number | null;
  nationality_preference: string | null;
  league_experience: string | null;
  player_type: string | null;
  contract_status_preference: string | null;
  budget_amount: number | null;
  budget_currency: string | null;
  budget_note: string | null;
  status_note: string | null;
  closed_at: string | null;
  last_confirmed_at: string;
  created_at: string;
  updated_at: string;
  clubs?: Club | null;
};

export type PlayerNeedWithClub = PlayerNeed & {
  clubs: Club;
};

export type AdminNote = {
  id: string;
  player_need_id: string;
  admin_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  users?: Profile | null;
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  club_id: string | null;
  player_need_id: string | null;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  users?: Profile | null;
};
