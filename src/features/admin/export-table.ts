import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { PlayerNeedWithClub } from "@/types/domain";

export const needExportHeader = [
  "Verein",
  "Liga",
  "Stadt",
  "Land",
  "Saison",
  "Position",
  "Benötigt ab",
  "Priorität",
  "Status",
  "Statusnotiz",
  "Abgeschlossen am",
  "Letzte Bestätigung",
  "Beschreibung",
  "Alter min",
  "Alter max",
  "Größe min",
  "Nationalität",
  "Liga-Erfahrung",
  "Spielertyp",
  "Vertragsstatus",
  "Budget",
  "Währung",
  "Budgetnotiz"
] as const;

export function buildNeedExportRows(needs: PlayerNeedWithClub[]) {
  return needs.map((need) => [
    need.clubs.name,
    need.clubs.league,
    need.clubs.city,
    need.clubs.country,
    need.season,
    need.position,
    formatDate(need.needed_from_date),
    PRIORITY_LABELS[need.priority],
    STATUS_LABELS[need.status],
    need.status_note,
    formatDate(need.closed_at),
    formatDate(need.last_confirmed_at),
    need.description,
    need.age_min,
    need.age_max,
    need.height_min,
    need.nationality_preference,
    need.league_experience,
    need.player_type,
    need.contract_status_preference,
    need.budget_amount,
    need.budget_currency,
    need.budget_note
  ]);
}

export function buildNeedExportTable(needs: PlayerNeedWithClub[]) {
  return [Array.from(needExportHeader), ...buildNeedExportRows(needs)];
}
