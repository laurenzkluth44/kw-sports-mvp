import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, Trash2 } from "lucide-react";
import { Flash } from "@/components/ui/flash";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { confirmKwPlayerAction, deleteKwPlayerAction, updateKwPlayerAction } from "@/features/kw-players/actions";
import { playerFreshness } from "@/features/kw-players/freshness";
import { formatDate } from "@/lib/utils";
import { signedFileUrls } from "@/features/kw-players/files";
import { KwPlayerForm } from "@/features/kw-players/kw-player-form";
import { KwPlayerStatsAdmin } from "@/features/kw-players/stats-admin";
import { requireAdmin } from "@/lib/auth";
import type { KwPlayer } from "@/types/domain";

export default async function EditKwPlayerPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; done?: string; stats?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data }, { count: matchCount }] = await Promise.all([
    supabase.from("kw_players").select("*, kw_player_games(*)").eq("id", id).maybeSingle(),
    supabase.from("need_matches").select("id", { count: "exact", head: true }).eq("player_id", id)
  ]);
  if (!data) notFound();
  const player = data as KwPlayer;
  const files = await signedFileUrls(supabase, [player.photo_path, player.cv_path]);
  const name = `${player.first_name} ${player.last_name}`;
  const freshness = playerFreshness(player);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Spielerdatenbank", href: "/admin/players" }, { label: name }]} />
      <PageHeader
        eyebrow="Spieler bearbeiten"
        title={name}
        description={`${matchCount ?? 0} Vorschläge an Vereine. Änderungen an Positionen oder Vertrag wirken sich sofort auf neue Vorschläge aus.`}
      />
      <Flash message={query.done === "confirmed" ? "Danke, Profil als aktuell bestätigt." : null} />
      {freshness.stale ? (
        <section className="flex flex-col gap-3 border-l-4 border-amber-400 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div>
              <p className="font-bold text-amber-950">
                {freshness.reason === "contract"
                  ? `Vertrag laut Profil am ${formatDate(player.contract_until)} ausgelaufen`
                  : `Seit ${freshness.days} Tagen nicht aktualisiert`}
              </p>
              <p className="mt-0.5 text-sm text-amber-900/80">
                {freshness.reason === "contract"
                  ? "Bitte aktuellen Verein, Vertrag oder „Verfügbar ab“ eintragen, bevor der Spieler einem Verein vorgeschlagen wird."
                  : "Stimmen Verein, Vertrag und Verfügbarkeit noch? Vereine sehen genau diese Angaben."}
              </p>
            </div>
          </div>
          {freshness.reason === "age" ? (
            <form action={confirmKwPlayerAction}>
              <input type="hidden" name="id" value={player.id} />
              <Button type="submit" variant="accent" className="w-full whitespace-nowrap sm:w-auto">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Daten sind aktuell
              </Button>
            </form>
          ) : null}
        </section>
      ) : null}
      <KwPlayerForm
        action={updateKwPlayerAction}
        player={player}
        error={query.error}
        photoUrl={player.photo_path ? files.get(player.photo_path) : null}
        cvUrl={player.cv_path ? files.get(player.cv_path) : null}
      />

      {player.kind === "spieler" ? (
        <KwPlayerStatsAdmin playerId={player.id} games={player.kw_player_games ?? []} result={query.stats} />
      ) : null}

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
