/**
 * Global search: pure helpers (no app imports, so the unit tests can run them with node).
 * The server action collects candidates the user is allowed to see (RLS) and ranks them here.
 */

/** Same normalisation as the player search: lowercase, no accents, ß → ss. */
function searchKey(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").toLowerCase();
}

export type SearchGroup = "pages" | "filters" | "players" | "squad" | "suggestions" | "needs" | "clubs" | "users";

export type SearchItem = {
  group: SearchGroup;
  title: string;
  subtitle?: string;
  href: string;
  /** Extra words that should match but are not shown (e.g. club, positions, e-mail). */
  keywords?: string;
};

export type SearchResult = { group: SearchGroup; items: SearchItem[] };

/** Order of the groups in the result list. */
export const GROUP_ORDER: SearchGroup[] = ["filters", "players", "squad", "suggestions", "needs", "clubs", "users", "pages"];

/**
 * Score of an item for a query: every word must appear somewhere (title, subtitle or keywords).
 * Title hits rank above subtitle/keyword hits, and a title that starts with the query ranks highest.
 * 0 = no match.
 */
export function scoreItem(item: Pick<SearchItem, "title" | "subtitle" | "keywords">, query: string) {
  const words = searchKey(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const title = searchKey(item.title);
  const rest = searchKey(`${item.subtitle ?? ""} ${item.keywords ?? ""}`);
  let score = 0;
  for (const word of words) {
    if (title.includes(word)) {
      score += title.startsWith(word) || title.includes(` ${word}`) ? 3 : 2;
    } else if (rest.includes(word)) {
      score += 1;
    } else {
      return 0;
    }
  }
  return score;
}

/** Ranks and groups items; at most `perGroup` hits per group. */
export function rankResults(items: SearchItem[], query: string, perGroup = 6): SearchResult[] {
  const scored = items
    .map((item, index) => ({ item, index, score: scoreItem(item, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return GROUP_ORDER.map((group) => ({
    group,
    items: scored.filter((entry) => entry.item.group === group).slice(0, perGroup).map((entry) => entry.item)
  })).filter((result) => result.items.length > 0);
}

const POSITIONS = ["TW", "LA", "RL", "RM", "RR", "RA", "KM"] as const;
const SEASON = /^(20\d{2})\s*[/-]\s*(\d{2}|\d{4})$/;

/**
 * Filter shortcuts from what was typed: a position code ("rr") or a season ("2027/28", "2027-28").
 * `base` is the needs list of the role (/admin or /agency); clubs filter on their own pages.
 */
export function filterShortcuts(query: string, base: string): { kind: "position" | "season"; value: string; href: string }[] {
  const text = query.trim();
  const out: { kind: "position" | "season"; value: string; href: string }[] = [];
  const upper = text.toUpperCase();
  if ((POSITIONS as readonly string[]).includes(upper)) {
    out.push({ kind: "position", value: upper, href: `${base}?position=${upper}` });
  }
  const season = text.match(SEASON);
  if (season) {
    const start = Number(season[1]);
    const end = season[2].slice(-2);
    if (Number(end) === (start + 1) % 100) {
      const value = `${start}/${end}`;
      out.push({ kind: "season", value, href: `${base}?season=${encodeURIComponent(value)}` });
    }
  }
  return out;
}
