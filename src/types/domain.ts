import type {
  ATTACK_POSITIONS,
  COACH_ROLES,
  COUNTRIES,
  DEFENSE_GROUPS,
  DEFENSE_POSITIONS,
  LANGUAGES,
  LEAGUES,
  NEED_TYPES,
  PLAYER_TYPES,
  PRIORITIES,
  STATUSES,
  TARGET_ROLES
} from "@/lib/constants";

export type AppRole = "admin" | "club" | "agency";
export type Country = (typeof COUNTRIES)[number];
export type League = (typeof LEAGUES)[number];
/** Season in the "2026/27" format, validated with isValidSeason. */
export type Season = string;
export type NeedType = (typeof NEED_TYPES)[number];
export type AttackPosition = (typeof ATTACK_POSITIONS)[number];
export type DefensePosition = (typeof DEFENSE_POSITIONS)[number];
export type DefenseGroup = (typeof DEFENSE_GROUPS)[number];
export type CoachRole = (typeof COACH_ROLES)[number];
export type PlayerType = (typeof PLAYER_TYPES)[number];
export type TargetRole = (typeof TARGET_ROLES)[number];
export type Language = (typeof LANGUAGES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type PlayerNeedStatus = (typeof STATUSES)[number];

export type Club = {
  id: string;
  name: string;
  country: string;
  league: League;
  city: string;
  website: string | null;
  logo_path: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  club_id: string | null;
  name: string;
  email: string;
  role: AppRole;
  agency_name: string | null;
  created_at: string;
  updated_at: string;
  clubs?: Club | null;
};

export type PlayerNeed = {
  id: string;
  club_id: string;
  season: Season;
  need_type: NeedType;
  attack_positions: AttackPosition[];
  defense_positions: DefensePosition[];
  coach_role: CoachRole | null;
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
  player_types: PlayerType[];
  target_roles: TargetRole[];
  languages: Language[];
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

export type PlayerNeedConfidential = {
  player_need_id: string;
  note: string;
  created_at: string;
  updated_at: string;
};

export type AdminNote = {
  id: string;
  player_need_id: string;
  admin_id: string | null;
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

export type RosterPlayer = {
  id: string;
  club_id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  position: AttackPosition;
  secondary_positions: AttackPosition[];
  defense_positions: DefensePosition[];
  contract_until: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
