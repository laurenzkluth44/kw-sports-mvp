import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { deleteRosterPlayerAction, updateRosterPlayerAction } from "@/features/squad/actions";
import { PlayerForm } from "@/features/squad/player-form";
import { requireClubUser } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { squadCopy } from "@/lib/squad-i18n";
import type { RosterPlayer } from "@/types/domain";

export default async function EditRosterPlayerPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireClubUser();
  const locale = await getClubLocale();
  const t = squadCopy[locale];
  const query = await searchParams;

  const { data } = await supabase
    .from("roster_players")
    .select("*")
    .eq("id", id)
    .eq("club_id", profile.club_id!)
    .maybeSingle();

  if (!data) redirect("/club/squad");
  const player = data as RosterPlayer;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.form.editTitle}
        title={`${player.first_name} ${player.last_name}`}
        description={t.form.editDescription}
      />

      <PlayerForm action={updateRosterPlayerAction} player={player} error={query.error === "save"} t={t} locale={locale} />

      <details className="panel overflow-hidden border-red-200">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-extrabold uppercase tracking-[0.06em] text-red-700 hover:bg-red-50">
          {t.form.deleteTitle}
        </summary>
        <form action={deleteRosterPlayerAction} className="flex flex-col gap-3 border-t border-red-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <input type="hidden" name="id" value={player.id} />
          <p className="text-sm text-slate-600">{query.error === "delete" ? t.form.deleteError : t.form.deleteBody}</p>
          <Button type="submit" variant="secondary" className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t.form.deleteButton}
          </Button>
        </form>
      </details>
    </div>
  );
}
