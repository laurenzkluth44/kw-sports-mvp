import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { createKwPlayerAction } from "@/features/kw-players/actions";
import { KwPlayerForm } from "@/features/kw-players/kw-player-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewKwPlayerPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Spielerdatenbank", href: "/admin/players" }, { label: "Spieler anlegen" }]} />
      <PageHeader
        eyebrow="KW Sports Admin"
        title="Spieler anlegen"
        description="Die Angaben zu Positionen, Vertrag, Alter und Profil nutzt das System, um den Spieler passenden Vereinsbedarfen vorzuschlagen."
      />
      <KwPlayerForm action={createKwPlayerAction} error={params.error} />
    </div>
  );
}
