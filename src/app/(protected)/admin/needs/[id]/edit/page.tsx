import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { NeedForm } from "@/features/player-needs/need-form";
import { updateAdminNeedAction } from "@/features/player-needs/actions";
import { parseNeedFormErrorCode } from "@/features/player-needs/form-schema";
import { needHeadline } from "@/features/player-needs/need-summary";
import { requireAdmin } from "@/lib/auth";
import type { Club, PlayerNeed } from "@/types/domain";

export default async function AdminNeedEditPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: need }, { data: clubs = [] }] = await Promise.all([
    supabase.from("player_needs").select("*, player_need_confidential(note)").eq("id", id).single(),
    supabase.from("clubs").select("*").order("name", { ascending: true })
  ]);

  if (!need) redirect("/admin");

  return (
    <div className="space-y-6">
      <PageHeader title="Bedarf bearbeiten" description={`${needHeadline(need)} · ${need.season}`} />
      <NeedForm
        action={updateAdminNeedAction}
        need={need as PlayerNeed}
        confidentialNote={need.player_need_confidential?.note}
        clubs={clubs as Club[]}
        submitLabel="Änderungen speichern"
        error={parseNeedFormErrorCode(query.error)}
      />
    </div>
  );
}
