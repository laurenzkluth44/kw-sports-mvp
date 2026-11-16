/**
 * Weekly agency digest: which needs to list. Pure (no app imports) so the tests can run it with node.
 */
type DigestNeed = {
  status: string;
  need_type: string;
  created_at: string;
  attack_positions: string[];
  priority: string | null;
};

/** Court order used everywhere in the app; coaches come last. */
const ORDER = ["TW", "LA", "RL", "RM", "RR", "RA", "KM"];
const PRIORITY = { hoch: 0, mittel: 1, niedrig: 2 } as Record<string, number>;

function positionRank(need: DigestNeed) {
  if (need.need_type === "trainer") return ORDER.length + 1;
  const ranks = need.attack_positions.map((position) => ORDER.indexOf(position)).filter((rank) => rank >= 0);
  return ranks.length ? Math.min(...ranks) : ORDER.length;
}

/** Needs created in the 7 days before `now` that are still open, sorted by position, then priority. */
export function digestNeeds<T extends DigestNeed>(needs: T[], now: Date, days = 7): T[] {
  const since = now.getTime() - days * 24 * 60 * 60 * 1000;
  return needs
    .filter((need) => (need.status === "offen" || need.status === "in_gespraechen") && new Date(need.created_at).getTime() >= since)
    .sort(
      (a, b) =>
        positionRank(a) - positionRank(b) ||
        (PRIORITY[a.priority ?? ""] ?? 3) - (PRIORITY[b.priority ?? ""] ?? 3) ||
        a.created_at.localeCompare(b.created_at)
    );
}

/** No language is stored per user: German for German-speaking domains, otherwise English. */
export function digestLocale(email: string): "de" | "en" {
  return /\.(de|at|ch)$/i.test(email.trim()) ? "de" : "en";
}
