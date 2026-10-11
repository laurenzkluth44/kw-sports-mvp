import { PageHeader } from "@/components/ui/page-header";
import { NeedForm } from "@/features/player-needs/need-form";
import { createAdminNeedAction } from "@/features/player-needs/actions";
import { parseNeedFormErrorCode } from "@/features/player-needs/form-schema";
import { requireAdmin } from "@/lib/auth";
import type { Club } from "@/types/domain";

export default async function NewAdminNeedPage({
  searchParams
}: {
  searchParams: Promise<{ club_id?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data: clubs = [] } = await supabase
    .from("clubs")
    .select("id,name,country,league,city,website,created_at,updated_at")
    .order("country", { ascending: true })
    .order("league", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Bedarf für Verein anlegen"
        description="Trage einen bekannten Kaderbedarf manuell für einen Verein ein, auch wenn der Club den Zugang noch nicht selbst nutzt."
      />
      <NeedForm
        action={createAdminNeedAction}
        clubs={clubs as Club[]}
        defaultClubId={params.club_id}
        submitLabel="Bedarf anlegen"
        error={parseNeedFormErrorCode(params.error)}
      />
    </div>
  );
}
