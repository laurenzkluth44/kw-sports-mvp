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

export const SEASONS = ["2025/26", "2026/27", "2027/28", "2028/29"] as const;

export const POSITIONS = [
  "TW",
  "LA",
  "RA",
  "RL",
  "RR",
  "RM",
  "KM",
  "Abwehrspezialist",
  "Universalspieler"
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
  club: "Club User"
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
