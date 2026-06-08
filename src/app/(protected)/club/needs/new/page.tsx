import { PageHeader } from "@/components/ui/page-header";
import { NeedForm } from "@/features/player-needs/need-form";
import { createClubNeedAction } from "@/features/player-needs/actions";
import { requireClubUser } from "@/lib/auth";
import { clubCopy } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";

export default async function NewClubNeedPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
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
        error={params.error === "save" ? params.error : null}
        locale={locale}
      />
    </div>
  );
}
