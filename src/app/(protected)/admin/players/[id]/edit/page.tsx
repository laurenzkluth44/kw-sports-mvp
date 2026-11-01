import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { deleteKwPlayerAction, updateKwPlayerAction } from "@/features/kw-players/actions";
import { signedFileUrls } from "@/features/kw-players/files";
import { KwPlayerForm } from "@/features/kw-players/kw-player-form";
import { requireAdmin } from "@/lib/auth";
import type { KwPlayer } from "@/types/domain";

export default async function EditKwPlayerPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("kw_players").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const player = data as KwPlayer;
  const { count: matchCount } = await supabase
    .from("need_matches")
    .select("id", { count: "exact", head: true })
    .eq("player_id", id);
  const files = await signedFileUrls(supabase, [player.photo_path, player.cv_path]);
  const name = `${player.first_name} ${player.last_name}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Spielerdatenbank", href: "/admin/players" }, { label: name }]} />
      <PageHeader
        eyebrow="Spieler bearbeiten"
        title={name}
        description={`${matchCount ?? 0} Vorschläge an Vereine. Änderungen an Positionen oder Vertrag wirken sich sofort auf neue Vorschläge aus.`}
      />
      <KwPlayerForm
        action={updateKwPlayerAction}
        player={player}
        error={query.error}
        photoUrl={player.photo_path ? files.get(player.photo_path) : null}
        cvUrl={player.cv_path ? files.get(player.cv_path) : null}
      />

      <details className="panel overflow-hidden border-red-200">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-extrabold uppercase tracking-[0.06em] text-red-700 hover:bg-red-50">
          Spieler löschen
        </summary>
        <form action={deleteKwPlayerAction} className="flex flex-col gap-3 border-t border-red-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <input type="hidden" name="id" value={player.id} />
          <p className="text-sm text-slate-600">
            Löscht Profil, Foto, CV und alle {matchCount ?? 0} Vorschläge an Vereine endgültig.
          </p>
          <Button type="submit" variant="secondary" className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Endgültig löschen
          </Button>
        </form>
      </details>
    </div>
  );
}
