import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { NeedForm } from "@/features/player-needs/need-form";
import { updateClubNeedAction } from "@/features/player-needs/actions";
import { requireClubUser } from "@/lib/auth";
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

  const { data: need } = await supabase
    .from("player_needs")
    .select("*")
    .eq("id", id)
    .eq("club_id", profile.club_id!)
    .single();

  if (!need) redirect("/club");

  return (
    <div className="space-y-6">
      <PageHeader title="Bedarf bearbeiten" description={`${need.position} · ${need.season}`} />
      <NeedForm
        action={updateClubNeedAction}
        need={need as PlayerNeed}
        submitLabel="Änderungen speichern"
        error={query.error === "save" ? query.error : null}
      />
    </div>
  );
}
