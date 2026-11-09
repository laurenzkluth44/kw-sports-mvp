/** Lowercase, without accents, ß → ss: "Sören" matches "soren", "Jonušauskas" matches "jonusauskas". */
export function searchKey(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").toLowerCase();
}

/** Every word of the query must appear in the name or club ("krist dorm" finds Luca Krist, TSV Bayer Dormagen). */
export function matchesPlayerSearch(player: { first_name: string; last_name: string; current_club: string | null }, query: string) {
  const words = searchKey(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = searchKey(`${player.first_name} ${player.last_name} ${player.current_club ?? ""}`);
  return words.every((word) => haystack.includes(word));
}
