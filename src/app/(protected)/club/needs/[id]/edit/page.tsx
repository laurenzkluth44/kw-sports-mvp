import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { NeedForm } from "@/features/player-needs/need-form";
import { updateClubNeedAction } from "@/features/player-needs/actions";
import { requireClubUser } from "@/lib/auth";
import { CLUB_POSITION_LABELS, clubCopy } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";
import type { PlayerNeed } from "@/types/domain";

export default async function EditClubNeedPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase, profile } = await requireClubUser();
  const locale = await getClubLocale();
  const t = clubCopy[locale].form;

  const { data: need } = await supabase
    .from("player_needs")
    .select("*")
    .eq("id", id)
    .eq("club_id", profile.club_id!)
    .single();

  if (!need) redirect("/club");
  const typedNeed = need as PlayerNeed;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.editTitle}
        description={`${CLUB_POSITION_LABELS[locale][typedNeed.position]} · ${typedNeed.season}`}
      />
      <NeedForm
        action={updateClubNeedAction}
        need={typedNeed}
        submitLabel={t.submitUpdate}
        error={query.error === "save" ? query.error : null}
        locale={locale}
      />
    </div>
  );
}
