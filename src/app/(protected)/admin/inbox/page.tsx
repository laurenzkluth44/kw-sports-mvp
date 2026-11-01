import { AdminInboxView, INBOX_TABS, type InboxTab } from "@/features/matching/admin-inbox";
import { requireAdmin } from "@/lib/auth";
import type { KwPlayer, NeedFillSource, NeedMatch, PlayerNeedWithClub, Profile } from "@/types/domain";

export default async function AdminInboxPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string; done?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const tab: InboxTab = INBOX_TABS.find((key) => key === params.tab) ?? "offen";

  const [{ data: matchRows }, { data: outcomeRows }] = await Promise.all([
    supabase.from("need_matches").select("*"),
    supabase.from("need_outcomes").select("need_id, filled_via")
  ]);
  const matches = (matchRows ?? []) as unknown as NeedMatch[];
  const needIds = [...new Set(matches.map((match) => match.need_id))];
  const playerIds = [...new Set(matches.map((match) => match.player_id))];

  const [{ data: needRows }, { data: playerRows }] = await Promise.all([
    needIds.length > 0
      ? supabase.from("player_needs").select("*, clubs(*)").in("id", needIds)
      : Promise.resolve({ data: [] }),
    playerIds.length > 0 ? supabase.from("kw_players").select("*").in("id", playerIds) : Promise.resolve({ data: [] })
  ]);
  const needs = (needRows ?? []) as PlayerNeedWithClub[];
  const clubIds = [...new Set(needs.map((need) => need.club_id))];
  const { data: userRows } =
    clubIds.length > 0
      ? await supabase.from("users").select("*").eq("role", "club").in("club_id", clubIds).order("name")
      : { data: [] };

  const contacts = new Map<string, Profile[]>();
  ((userRows ?? []) as Profile[]).forEach((user) => {
    if (!user.club_id) return;
    contacts.set(user.club_id, [...(contacts.get(user.club_id) ?? []), user]);
  });

  return (
    <AdminInboxView
      tab={tab}
      matches={matches}
      needs={needs}
      players={(playerRows ?? []) as KwPlayer[]}
      contacts={contacts}
      done={params.done}
      error={params.error}
      outcomes={(outcomeRows ?? []) as { need_id: string; filled_via: NeedFillSource }[]}
    />
  );
}
