import { PageHeader } from "@/components/ui/page-header";
import { NeedForm } from "@/features/player-needs/need-form";
import { createClubNeedAction } from "@/features/player-needs/actions";
import { requireClubUser } from "@/lib/auth";

export default async function NewClubNeedPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireClubUser();
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Neuen Bedarf anlegen"
        description="Pflichtfelder ausfüllen, optionales Profil ergänzen und speichern."
      />
      <NeedForm
        action={createClubNeedAction}
        submitLabel="Bedarf anlegen"
        error={params.error === "save" ? params.error : null}
      />
    </div>
  );
}
