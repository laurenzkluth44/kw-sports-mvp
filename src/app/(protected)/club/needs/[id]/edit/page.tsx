import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { NeedForm } from "@/features/player-needs/need-form";
import { updateClubNeedAction } from "@/features/player-needs/actions";
import { parseNeedFormErrorCode } from "@/features/player-needs/form-schema";
import { needHeadline } from "@/features/player-needs/need-summary";
import { requireClubUser } from "@/lib/auth";
import { clubCopy } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";
import { cockpitCopy } from "@/lib/cockpit-i18n";
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
    .select("*, player_need_confidential(note)")
    .eq("id", id)
    .eq("club_id", profile.club_id!)
    .single();

  if (!need) notFound();
  const typedNeed = need as PlayerNeed;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: cockpitCopy[locale].nav, href: "/club" },
          { label: needHeadline(typedNeed, locale), href: `/club/needs/${typedNeed.id}` },
          { label: t.editTitle }
        ]}
      />
      <PageHeader
        title={t.editTitle}
        description={`${needHeadline(typedNeed, locale)} · ${typedNeed.season}`}
      />
      <NeedForm
        action={updateClubNeedAction}
        need={typedNeed}
        confidentialNote={need.player_need_confidential?.note}
        submitLabel={t.submitUpdate}
        error={parseNeedFormErrorCode(query.error)}
        locale={locale}
      />
    </div>
  );
}
