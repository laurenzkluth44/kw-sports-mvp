import { signedFileUrls } from "@/features/kw-players/files";
import { ClubSuggestionsView } from "@/features/matching/club-suggestions";
import { requireClubUser } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import type { KwPlayer, NeedMatch, PlayerNeed } from "@/types/domain";

export default async function ClubSuggestionsPage({
  searchParams
}: {
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  const { supabase, profile } = await requireClubUser();
  const locale = await getClubLocale();
  const params = await searchParams;

  // Access rules limit all three queries to this club's needs and the players KW released to it.
  const [{ data: needRows }, { data: matchRows }, { data: playerRows }] = await Promise.all([
    supabase.from("player_needs").select("*").eq("club_id", profile.club_id!),
    supabase.from("need_matches").select("*").order("released_at", { ascending: false }),
    supabase.from("kw_players").select("*, kw_player_games(*)")
  ]);

  // Opening this page counts as "seen" for KW Sports (only the first time is kept).
  const unseen = ((matchRows ?? []) as unknown as NeedMatch[]).filter((match) => !match.seen_at).map((match) => match.id);
  if (unseen.length > 0) await supabase.rpc("mark_need_matches_seen", { match_ids: unseen });

  const players = (playerRows ?? []) as KwPlayer[];
  const files = await signedFileUrls(
    supabase,
    players.flatMap((player) => [player.photo_path, player.cv_path]),
    60 * 30
  );

  return (
    <ClubSuggestionsView
      locale={locale}
      needs={(needRows ?? []) as PlayerNeed[]}
      players={players}
      matches={(matchRows ?? []) as unknown as NeedMatch[]}
      files={files}
      done={params.done}
      error={params.error}
    />
  );
}
