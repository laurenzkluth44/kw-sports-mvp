import type { KwPlayer } from "@/types/domain";

/** After this many days without an update a profile should be checked before it goes to a club. */
export const PROFILE_STALE_DAYS = 90;
const DAY = 24 * 60 * 60 * 1000;

export type Freshness =
  | { stale: false; days: number }
  | { stale: true; days: number; reason: "contract" | "age"; label: string };

/**
 * Is this KW player's data still trustworthy? A contract end in the past (with no newer
 * availability date) means club and contract are almost certainly outdated; otherwise
 * the profile is flagged when it hasn't been touched for PROFILE_STALE_DAYS.
 */
export function playerFreshness(
  player: Pick<KwPlayer, "updated_at" | "contract_until" | "available_from">,
  now = new Date()
): Freshness {
  const updated = new Date(player.updated_at).getTime();
  const days = Number.isNaN(updated) ? 0 : Math.max(0, Math.floor((now.getTime() - updated) / DAY));
  const today = now.toISOString().slice(0, 10);

  const contractOver = player.contract_until !== null && player.contract_until < today;
  const availabilityNewer = player.available_from !== null && player.available_from >= (player.contract_until ?? "");
  // The contract ran out after the last update: club and contract data are outdated.
  if (contractOver && !availabilityNewer && player.contract_until! >= player.updated_at.slice(0, 10)) {
    return { stale: true, days, reason: "contract", label: "Vertrag abgelaufen" };
  }
  if (days >= PROFILE_STALE_DAYS) {
    return { stale: true, days, reason: "age", label: `Seit ${days} Tagen nicht aktualisiert` };
  }
  return { stale: false, days };
}
