import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { BulkUpload, type BulkUploadPlayer } from "@/features/kw-players/bulk-upload";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "CVs & Fotos hochladen" };

export default async function BulkUploadPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("kw_players").select("id, first_name, last_name, kind, photo_path, cv_path");
  const players: BulkUploadPlayer[] = (data ?? []).map((player) => ({
    id: player.id,
    first_name: player.first_name,
    last_name: player.last_name,
    kind: player.kind,
    has_photo: Boolean(player.photo_path),
    has_cv: Boolean(player.cv_path)
  }));
  const missing = players.filter((player) => !player.has_photo || !player.has_cv).length;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Spielerdatenbank", href: "/admin/players" }, { label: "CVs & Fotos hochladen" }]} />
      <PageHeader
        eyebrow="Spielerdatenbank"
        title="CVs & Fotos hochladen"
        description={`Zieh alle Dateien auf einmal hier rein. Die Plattform erkennt den Spieler am Dateinamen, du prüfst die Zuordnung und lädst mit einem Klick hoch. Bei ${missing} von ${players.length} Profilen fehlt noch Foto oder CV.`}
      />
      <BulkUpload players={players} />
    </div>
  );
}
