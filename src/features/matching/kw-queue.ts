import { rankPlayersForNeed } from "@/features/matching/engine";
import type { NeedKwInfo } from "@/features/needs-overview/need-card";
import type { KwPlayer, NeedMatchStatus, PlayerNeed } from "@/types/domain";

/**
 * KW work queue numbers per need: consented KW players that fit and weren't sent yet,
 * plus what was already sent and how clubs answered. KW admin only.
 */
export function buildKwInfo<N extends PlayerNeed>(
  needs: N[],
  players: KwPlayer[],
  matches: { need_id: string; player_id: string; status: NeedMatchStatus }[]
) {
  const releasable = players.filter((player) => player.visible_to_clubs);
  const sentByNeed = new Map<string, { players: Set<string>; interested: number }>();
  matches.forEach((row) => {
    const entry = sentByNeed.get(row.need_id) ?? { players: new Set<string>(), interested: 0 };
    entry.players.add(row.player_id);
    if (row.status === "interessiert") entry.interested += 1;
    sentByNeed.set(row.need_id, entry);
  });

  const info: Record<string, NeedKwInfo> = {};
  needs.forEach((need) => {
    const sent = sentByNeed.get(need.id);
    const fits = rankPlayersForNeed(need, releasable).filter((result) => !sent?.players.has(result.player.id));
    info[need.id] = { fit: fits.length, best: fits[0]?.score ?? 0, sent: sent?.players.size ?? 0, interested: sent?.interested ?? 0 };
  });

  const queue = needs.filter(
    (need) => (need.status === "offen" || need.status === "in_gespraechen") && info[need.id].sent === 0 && info[need.id].fit > 0
  );
  return { info, queue };
}
