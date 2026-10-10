import { needProfileLabels } from "@/features/player-needs/need-summary";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { PlayerNeedWithClub } from "@/types/domain";

export type ExportNeed = PlayerNeedWithClub & {
  player_need_confidential?: { note: string } | null;
};

export const needExportHeader = [
  "Verein",
  "Liga",
  "Stadt",
  "Land",
  "Saison",
  "Art",
  "Angriffspositionen",
  "Abwehrpositionen",
  "Trainerrolle",
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
  "Sprachkenntnisse",
  "Liga-Erfahrung",
  "Spielertyp",
  "Anvisierte Rolle",
  "Weitere Merkmale",
  "Vertragsstatus",
  "Budget",
  "Währung",
  "Budgetnotiz",
  "Vertraulich (nur KW)"
] as const;

export function buildNeedExportRows(needs: ExportNeed[]) {
  return needs.map((need) => {
    const labels = needProfileLabels(need);

    return [
      need.clubs.name,
      need.clubs.league,
      need.clubs.city,
      need.clubs.country,
      need.season,
      labels.needType,
      labels.attackPositions.join(", "),
      labels.defensePositions.join(", "),
      labels.coachRole,
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
      labels.languages.join(", "),
      need.league_experience,
      labels.playerTypes.join(", "),
      labels.targetRoles.join(", "),
      need.player_type,
      need.contract_status_preference,
      need.budget_amount,
      need.budget_currency,
      need.budget_note,
      need.player_need_confidential?.note ?? null
    ];
  });
}

export function buildNeedExportTable(needs: ExportNeed[]) {
  return [Array.from(needExportHeader), ...buildNeedExportRows(needs)];
}
