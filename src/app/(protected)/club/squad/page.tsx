import { SquadScreen } from "@/features/squad/squad-screen";
import { requireClubUser } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import type { RosterPlayer } from "@/types/domain";

export default async function SquadPage({
  searchParams
}: {
  searchParams: Promise<{ season?: string; view?: string; done?: string }>;
}) {
  const { supabase, profile } = await requireClubUser();
  const locale = await getClubLocale();
  const params = await searchParams;

  const { data } = await supabase
    .from("roster_players")
    .select("*")
    .eq("club_id", profile.club_id!)
    .order("last_name", { ascending: true });

  return (
    <SquadScreen
      players={(data ?? []) as RosterPlayer[]}
      clubName={profile.clubs?.name}
      locale={locale}
      seasonParam={params.season}
      viewParam={params.view}
      done={params.done}
    />
  );
}
