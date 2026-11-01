import type { AttackPosition, DefensePosition } from "@/types/domain";

/**
 * Turns a pasted/uploaded squad table into roster rows. Pure functions, no I/O, so the
 * whole import logic is unit-tested. Understands German, English, French and Spanish
 * headers and position names, and the usual ways clubs write contract ends.
 */

const ATTACK: readonly AttackPosition[] = ["TW", "LA", "RL", "RM", "RR", "RA", "KM"];

export type ImportRow = {
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  position: AttackPosition;
  secondary_positions: AttackPosition[];
  defense_positions: DefensePosition[];
  contract_until: string;
  notes: string | null;
};

export type ImportIssue = "name" | "position" | "contract" | "duplicate";
export type ImportResult = {
  rows: { line: number; row: ImportRow }[];
  skipped: { line: number; label: string; issue: ImportIssue; value?: string }[];
  /** Which known columns were found (for the preview). */
  columns: string[];
  headerFound: boolean;
};

type Column = "first" | "last" | "name" | "position" | "secondary" | "defense" | "contract" | "jersey" | "notes";

export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9#/]+/g, " ")
    .trim();
}

const HEADERS: Record<Column, string[]> = {
  first: ["vorname", "first name", "firstname", "given name", "prenom", "nombre"],
  last: ["nachname", "familienname", "last name", "lastname", "surname", "family name", "nom", "apellido", "apellidos"],
  name: ["name", "spieler", "spielername", "player", "player name", "joueur", "jugador", "nombre completo"],
  position: ["position", "pos", "hauptposition", "main position", "poste", "posicion", "puesto"],
  secondary: ["nebenposition", "nebenpositionen", "weitere positionen", "zweitposition", "secondary", "secondary positions", "other positions", "poste secondaire", "posicion secundaria"],
  defense: ["abwehr", "abwehrposition", "abwehrpositionen", "defense", "defence", "defensive position", "defense positions", "defence positions", "defensa", "defensive"],
  contract: ["vertrag bis", "vertragsende", "vertrag", "vertragslaufzeit", "contract", "contract until", "contract end", "fin de contrat", "contrat", "contrato", "contrato hasta", "fin contrato"],
  jersey: ["nr", "nr.", "nummer", "ruckennummer", "rueckennummer", "trikot", "trikotnummer", "#", "number", "no", "shirt", "numero", "dorsal"],
  notes: ["notiz", "notizen", "bemerkung", "bemerkungen", "kommentar", "notes", "note", "comment", "remarque", "nota", "notas"]
};

const POSITION_WORDS: Record<AttackPosition, string[]> = {
  TW: ["tw", "torwart", "torhuter", "torhueter", "goalkeeper", "gk", "keeper", "gardien", "gb", "portero", "po"],
  LA: ["la", "linksaussen", "linksauen", "lw", "left wing", "left winger", "ailier gauche", "ag", "extremo izquierdo", "ei"],
  RL: ["rl", "ruckraum links", "rueckraum links", "lb", "left back", "arriere gauche", "lateral izquierdo", "li"],
  RM: ["rm", "ruckraum mitte", "rueckraum mitte", "mitte", "spielmacher", "cb", "centre back", "center back", "playmaker", "demi centre", "dc", "central", "ce"],
  RR: ["rr", "ruckraum rechts", "rueckraum rechts", "rb", "right back", "arriere droit", "lateral derecho", "ld"],
  RA: ["ra", "rechtsaussen", "rw", "right wing", "right winger", "ailier droit", "ad", "extremo derecho", "ed"],
  KM: ["km", "kreislaufer", "kreislaeufer", "kreis", "kl", "pivot", "line player", "lp", "pv", "pivote"]
};

export function parsePosition(value: string): AttackPosition | null {
  const text = normalize(value);
  if (!text) return null;
  for (const position of ATTACK) {
    if (POSITION_WORDS[position].includes(text)) return position;
  }
  // "RR (Linkshänder)" or "Rückraum rechts / Mitte": take the first known word.
  for (const position of ATTACK) {
    if (POSITION_WORDS[position].some((word) => word.length > 2 && text.startsWith(word))) return position;
  }
  const code = text.slice(0, 2).toUpperCase() as AttackPosition;
  return ATTACK.includes(code) && (text.length === 2 || /^[a-z]{2}\b/.test(text)) ? code : null;
}

export function parsePositionList(value: string): AttackPosition[] {
  return [
    ...new Set(
      value
        .split(/[,;/+|]|\bund\b|\band\b|\bet\b|\by\b/i)
        .map((part) => parsePosition(part))
        .filter((position): position is AttackPosition => position !== null)
    )
  ];
}

export function parseDefense(value: string): DefensePosition[] {
  return [...new Set((value.match(/[1-6]/g) ?? []).map(Number))].sort() as DefensePosition[];
}

function iso(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  if (year < 2000 || year > 2100) return null;
  return date.toISOString().slice(0, 10);
}

/** "2027/28", "27/28", "30.06.2027", "2027-06-30", "06/2027", "2027", Excel serial "46568" → ISO date. */
export function parseContractEnd(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  let match = /^(\d{4})\s*[/-]\s*(\d{2})$/.exec(text);
  if (match && (Number(match[1]) + 1) % 100 === Number(match[2])) return iso(Number(match[1]) + 1, 6, 30);
  match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(text);
  if (match && (Number(match[1]) + 1) % 100 === Number(match[2])) return iso(2000 + Number(match[1]) + 1, 6, 30);
  match = /^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/.exec(text);
  if (match) {
    const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
    return iso(year, Number(match[2]), Number(match[1]));
  }
  match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(text);
  if (match) return iso(Number(match[1]), Number(match[2]), Number(match[3]));
  match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (match) return iso(Number(match[3]), Number(match[2]), Number(match[1]));
  match = /^(\d{1,2})\s*[/.-]\s*(\d{4})$/.exec(text);
  if (match) {
    const month = Number(match[1]);
    const year = Number(match[2]);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return iso(year, month, lastDay);
  }
  match = /^(\d{4})$/.exec(text);
  if (match) return iso(Number(match[1]), 6, 30);
  // Excel date serial (days since 1899-12-30), for dates between 2000 and 2100.
  if (/^\d{5}(\.\d+)?$/.test(text)) {
    const serial = Math.floor(Number(text));
    if (serial > 36526 && serial < 73051) {
      return new Date(Date.UTC(1899, 11, 30) + serial * 86400000).toISOString().slice(0, 10);
    }
  }
  return null;
}

function detectColumns(header: string[]) {
  const map = new Map<Column, number>();
  header.forEach((cell, index) => {
    const text = normalize(cell);
    if (!text) return;
    for (const column of Object.keys(HEADERS) as Column[]) {
      if (!map.has(column) && HEADERS[column].includes(text)) {
        map.set(column, index);
        return;
      }
    }
  });
  // "Name" next to "Vorname" means last name.
  if (map.has("first") && map.has("name") && !map.has("last")) {
    map.set("last", map.get("name")!);
    map.delete("name");
  }
  return map;
}

function splitName(full: string) {
  const text = full.trim().replace(/\s+/g, " ");
  if (text.includes(",")) {
    const [last, first] = text.split(",").map((part) => part.trim());
    return { first: first ?? "", last: last ?? "" };
  }
  const parts = text.split(" ");
  if (parts.length === 1) return { first: "", last: parts[0] };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

export function parseRosterTable(table: string[][], existing: { first_name: string; last_name: string }[] = []): ImportResult {
  const headerIndex = table.slice(0, 12).findIndex((row) => {
    const columns = detectColumns(row);
    return (columns.has("position") || columns.has("contract")) && (columns.has("last") || columns.has("name") || columns.has("first"));
  });

  if (headerIndex < 0) return { rows: [], skipped: [], columns: [], headerFound: false };

  const columns = detectColumns(table[headerIndex]);
  const cell = (row: string[], column: Column) => {
    const index = columns.get(column);
    return index === undefined ? "" : (row[index] ?? "").trim();
  };
  const seen = new Set(existing.map((player) => `${normalize(player.first_name)}|${normalize(player.last_name)}`));
  const result: ImportResult = { rows: [], skipped: [], columns: [...columns.keys()], headerFound: true };

  table.slice(headerIndex + 1).forEach((row, offset) => {
    const line = headerIndex + offset + 2;
    if (!row.some((value) => value.trim())) return;
    let first = cell(row, "first");
    let last = cell(row, "last");
    if (!first && !last && columns.has("name")) ({ first, last } = splitName(cell(row, "name")));
    const label = [first, last].filter(Boolean).join(" ") || `#${line}`;

    if (!first || !last || first.length > 80 || last.length > 80) {
      result.skipped.push({ line, label, issue: "name" });
      return;
    }
    const positionRaw = cell(row, "position");
    const positions = parsePositionList(positionRaw);
    if (positions.length === 0) {
      result.skipped.push({ line, label, issue: "position", value: positionRaw });
      return;
    }
    const contractRaw = cell(row, "contract");
    const contract = parseContractEnd(contractRaw);
    if (!contract) {
      result.skipped.push({ line, label, issue: "contract", value: contractRaw });
      return;
    }
    const key = `${normalize(first)}|${normalize(last)}`;
    if (seen.has(key)) {
      result.skipped.push({ line, label, issue: "duplicate" });
      return;
    }
    seen.add(key);

    const [position, ...extra] = positions;
    const secondary = [...new Set([...extra, ...parsePositionList(cell(row, "secondary"))])].filter((value) => value !== position);
    const jerseyRaw = cell(row, "jersey").replace(/^#/, "");
    const jersey = /^\d{1,2}$/.test(jerseyRaw) ? Number(jerseyRaw) : null;
    const notes = cell(row, "notes").slice(0, 2000);

    result.rows.push({
      line,
      row: {
        first_name: first,
        last_name: last,
        jersey_number: jersey,
        position,
        secondary_positions: secondary,
        defense_positions: parseDefense(cell(row, "defense")),
        contract_until: contract,
        notes: notes || null
      }
    });
  });

  return result;
}

/** Server-side re-check of a row coming back from the preview form. */
export function validImportRow(value: unknown): ImportRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const first = typeof row.first_name === "string" ? row.first_name.trim() : "";
  const last = typeof row.last_name === "string" ? row.last_name.trim() : "";
  const position = row.position as AttackPosition;
  const contract = typeof row.contract_until === "string" ? parseContractEnd(row.contract_until) : null;
  if (!first || !last || first.length > 80 || last.length > 80 || !ATTACK.includes(position) || !contract) return null;
  const secondary = Array.isArray(row.secondary_positions)
    ? (row.secondary_positions.filter((item) => ATTACK.includes(item as AttackPosition) && item !== position) as AttackPosition[])
    : [];
  const defense = Array.isArray(row.defense_positions)
    ? (row.defense_positions.filter((item) => Number.isInteger(item) && (item as number) >= 1 && (item as number) <= 6) as DefensePosition[])
    : [];
  const jersey = Number.isInteger(row.jersey_number) && (row.jersey_number as number) >= 0 && (row.jersey_number as number) <= 99 ? (row.jersey_number as number) : null;
  const notes = typeof row.notes === "string" && row.notes.trim() ? row.notes.trim().slice(0, 2000) : null;
  return {
    first_name: first,
    last_name: last,
    jersey_number: jersey,
    position,
    secondary_positions: [...new Set(secondary)],
    defense_positions: [...new Set(defense)],
    contract_until: contract,
    notes
  };
}
