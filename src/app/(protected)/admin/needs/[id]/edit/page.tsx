import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { NeedForm } from "@/features/player-needs/need-form";
import { updateAdminNeedAction } from "@/features/player-needs/actions";
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
    supabase.from("player_needs").select("*").eq("id", id).single(),
    supabase.from("clubs").select("*").order("name", { ascending: true })
  ]);

  if (!need) redirect("/admin");

  return (
    <div className="space-y-6">
      <PageHeader title="Bedarf bearbeiten" description={`${need.position} · ${need.season}`} />
      <NeedForm
        action={updateAdminNeedAction}
        need={need as PlayerNeed}
        clubs={clubs as Club[]}
        submitLabel="Änderungen speichern"
        error={query.error === "save" ? query.error : null}
      />
    </div>
  );
}
