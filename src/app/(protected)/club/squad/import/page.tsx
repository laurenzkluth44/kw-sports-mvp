import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { commitSquadImportAction, previewSquadImportAction } from "@/features/squad/import-actions";
import { SquadImportScreen } from "@/features/squad/import-screen";
import { requireClubUser } from "@/lib/auth";
import { clubCopy } from "@/lib/club-i18n";
import { getClubLocale } from "@/lib/club-locale";
import { squadImportCopy } from "@/lib/squad-import-i18n";

export default async function SquadImportPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { profile } = await requireClubUser();
  const locale = await getClubLocale();
  const t = squadImportCopy[locale];
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: clubCopy[locale].app.navSquad, href: "/club/squad" }, { label: t.title }]} />
      <PageHeader eyebrow={profile.clubs?.name || t.eyebrow} title={t.title} description={t.intro} />
      <SquadImportScreen
        t={t}
        locale={locale}
        previewAction={previewSquadImportAction}
        commitAction={commitSquadImportAction}
        saveError={params.error === "save"}
      />
    </div>
  );
}
