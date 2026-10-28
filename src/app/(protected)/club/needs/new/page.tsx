import { PageHeader } from "@/components/ui/page-header";
import { NeedForm, type NeedPrefill } from "@/features/player-needs/need-form";
import { createClubNeedAction } from "@/features/player-needs/actions";
import { parseNeedFormErrorCode } from "@/features/player-needs/form-schema";
import { requireClubUser } from "@/lib/auth";
import { clubCopy } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";
import { ATTACK_POSITIONS, DEFENSE_POSITIONS, isValidSeason, seasonStartDate } from "@/lib/constants";
import type { AttackPosition, DefensePosition } from "@/types/domain";

type SearchParams = { error?: string; position?: string; defense?: string; season?: string };

// Links from a squad gap look like /club/needs/new?position=RR&season=2027/28
function parsePrefill(params: SearchParams): NeedPrefill | undefined {
  const position = ATTACK_POSITIONS.find((value) => value === params.position);
  const defense = DEFENSE_POSITIONS.find((value) => String(value) === params.defense);
  const season = params.season && isValidSeason(params.season) ? params.season : undefined;

  if (!position && !defense && !season) return undefined;

  return {
    attack_positions: position ? [position as AttackPosition] : undefined,
    defense_positions: defense ? [defense as DefensePosition] : undefined,
    season,
    needed_from_date: season ? seasonStartDate(season) : undefined
  };
}

export default async function NewClubNeedPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireClubUser();
  const locale = await getClubLocale();
  const t = clubCopy[locale].form;
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.newTitle}
        description={t.newDescription}
      />
      <NeedForm
        action={createClubNeedAction}
        submitLabel={t.submitCreate}
        error={parseNeedFormErrorCode(params.error)}
        prefill={parsePrefill(params)}
        locale={locale}
      />
    </div>
  );
}
