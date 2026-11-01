import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { clubCopy } from "@/lib/club-i18n";
import { createRosterPlayerAction } from "@/features/squad/actions";
import { PlayerForm } from "@/features/squad/player-form";
import { requireClubUser } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { ATTACK_POSITIONS } from "@/lib/constants";
import { squadCopy } from "@/lib/squad-i18n";

export default async function NewRosterPlayerPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; position?: string }>;
}) {
  const { profile } = await requireClubUser();
  const locale = await getClubLocale();
  const t = squadCopy[locale];
  const params = await searchParams;
  const defaultPosition = ATTACK_POSITIONS.find((position) => position === params.position);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: clubCopy[locale].app.navSquad, href: "/club/squad" }, { label: t.form.newTitle }]} />
      <PageHeader eyebrow={profile.clubs?.name || t.page.eyebrow} title={t.form.newTitle} description={t.form.newDescription} />
      <PlayerForm
        action={createRosterPlayerAction}
        defaultPosition={defaultPosition}
        error={params.error === "save"}
        t={t}
        locale={locale}
      />
    </div>
  );
}
