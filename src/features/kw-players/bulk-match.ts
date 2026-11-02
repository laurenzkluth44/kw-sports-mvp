/**
 * Assigns dropped files (CVs, photos) to KW players by file name. Pure, so it runs in the
 * browser before anything is uploaded and is covered by unit tests.
 *
 * Understood names, among others:
 *   20261027_KW_CV_Alexander_Schoss_DE.pdf   (KW CV skill)
 *   athlete-soeren-steinhaus.jpg              (website photos)
 *   Luca Krist.png, krist_luca.webp
 */

export type BulkKind = "cv" | "photo";
export type BulkPlayer = { id: string; first_name: string; last_name: string };

export type BulkMatch = {
  kind: BulkKind | null;
  playerId: string | null;
  /** Why a file can't be used as is; null when it can be uploaded. */
  problem: "type" | "unmatched" | "ambiguous" | null;
  /** Language suffix of a KW CV (DE/EN), used to pick one CV per player. */
  lang: "de" | "en" | null;
  /** Leading date of a KW CV (YYYYMMDD); newer wins. */
  stamp: string | null;
};

const PHOTO_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

/** Lowercase ASCII tokens; umlauts both ways (ö → oe) so "soeren" matches "Sören". */
export function nameTokens(value: string): string[] {
  const lower = value.toLowerCase().replace(/ß/g, "ss").replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa");
  const umlauts = lower.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
  const ascii = umlauts.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return ascii.split(/[^a-z]+/).filter(Boolean);
}

/** Same name without umlaut expansion (ö → o), for files written without them. */
function plainTokens(value: string): string[] {
  return nameTokens(value.normalize("NFD").replace(/[̀-ͯ]/g, ""));
}

const NOISE = new Set(["kw", "cv", "de", "en", "athlete", "foto", "photo", "bild", "portrait", "lebenslauf", "spieler", "trainer", "final", "neu", "new"]);

export function fileKind(fileName: string): BulkKind | null {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf") return "cv";
  if (PHOTO_EXT.has(ext)) return "photo";
  return null;
}

export function matchFile(fileName: string, players: BulkPlayer[]): BulkMatch {
  const kind = fileKind(fileName);
  const base = fileName.replace(/\.[^.]+$/, "");
  const stamp = base.match(/^(\d{8})/)?.[1] ?? null;
  const langMatch = base.match(/[_\-\s](DE|EN)$/i);
  const lang = langMatch ? (langMatch[1].toLowerCase() as "de" | "en") : null;
  if (!kind) return { kind: null, playerId: null, problem: "type", lang, stamp };

  const tokens = new Set(nameTokens(base).filter((token) => !NOISE.has(token)));
  const plain = new Set(plainTokens(base).filter((token) => !NOISE.has(token)));
  const has = (part: string) => {
    const a = nameTokens(part);
    const b = plainTokens(part);
    return (a.length > 0 && a.every((t) => tokens.has(t))) || (b.length > 0 && b.every((t) => plain.has(t)));
  };

  const full = players.filter((player) => has(player.first_name) && has(player.last_name));
  if (full.length === 1) return { kind, playerId: full[0].id, problem: null, lang, stamp };
  if (full.length > 1) return { kind, playerId: null, problem: "ambiguous", lang, stamp };

  // Only a last name in the file (e.g. "krist.jpg"): fine when exactly one player has it.
  const byLast = players.filter((player) => has(player.last_name));
  if (byLast.length === 1) return { kind, playerId: byLast[0].id, problem: null, lang, stamp };
  return { kind, playerId: null, problem: byLast.length > 1 ? "ambiguous" : "unmatched", lang, stamp };
}

/**
 * With several CVs or photos for one player, only one is used: the newest KW CV, German
 * before English (the platform's main language). Returns the indexes of the files to skip.
 */
export function duplicatesToSkip(matches: { match: BulkMatch; size: number }[]): Set<number> {
  const best = new Map<string, number>();
  const rank = (m: BulkMatch) => `${m.stamp ?? "00000000"}${m.lang === "de" ? 2 : m.lang === null ? 1 : 0}`;
  matches.forEach(({ match }, index) => {
    if (!match.playerId || !match.kind || match.problem) return;
    const key = `${match.playerId}:${match.kind}`;
    const current = best.get(key);
    if (current === undefined || rank(match) > rank(matches[current].match)) best.set(key, index);
  });
  const skip = new Set<number>();
  matches.forEach(({ match }, index) => {
    if (!match.playerId || !match.kind || match.problem) return;
    if (best.get(`${match.playerId}:${match.kind}`) !== index) skip.add(index);
  });
  return skip;
}
