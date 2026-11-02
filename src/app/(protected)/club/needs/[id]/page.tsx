import { notFound } from "next/navigation";
import { ClubNeedView } from "@/features/club/club-need-view";
import { signedFileUrls } from "@/features/kw-players/files";
import { requireClubUser } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import type { KwPlayer, NeedMatch, PlayerNeedWithClub } from "@/types/domain";

/**
 * The club's own need: what it looks like for KW Sports and the agencies, its status,
 * and the KW players released for it, answerable right here.
 */
export default async function ClubNeedPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase, profile } = await requireClubUser();
  const locale = await getClubLocale();

  const [{ data }, { data: matchRows }] = await Promise.all([
    supabase
      .from("player_needs")
      .select("*, clubs!inner(id,name,country,league,city,website,logo_path,created_at,updated_at), player_need_confidential(note)")
      .eq("id", id)
      .eq("club_id", profile.club_id!)
      .maybeSingle(),
    // Access rules only return matches for this club's needs and players KW released.
    supabase.from("need_matches").select("*").eq("need_id", id).order("score", { ascending: false })
  ]);
  if (!data) notFound();

  const need = data as PlayerNeedWithClub & { player_need_confidential?: { note: string | null } | null };
  const matches = (matchRows ?? []) as unknown as NeedMatch[];
  const playerIds = matches.map((match) => match.player_id);
  const { data: playerRows } = playerIds.length
    ? await supabase.from("kw_players").select("*").in("id", playerIds)
    : { data: [] as KwPlayer[] };
  const players = new Map(((playerRows ?? []) as KwPlayer[]).map((player) => [player.id, player]));
  const files = await signedFileUrls(
    supabase,
    [...players.values()].flatMap((player) => [player.photo_path, player.cv_path]),
    60 * 30
  );

  return <ClubNeedView need={need} matches={matches} players={players} files={files} locale={locale} query={query} />;
}
