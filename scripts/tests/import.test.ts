// Unit tests for the squad import (Excel/CSV reader + parser). Run: node --experimental-strip-types scripts/tests/import.test.ts
import { createXlsxWorkbook } from "../../src/lib/xlsx.ts";
import { readCsv, readTableFile } from "../../src/lib/table-read.ts";
import { parseContractEnd, parsePosition, parseRosterTable, validImportRow } from "../../src/features/squad/import-parse.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };

// Positions in four languages
assert(parsePosition("Rückraum rechts") === "RR", "position: Rückraum rechts → RR");
assert(parsePosition("Linksaußen") === "LA", "position: Linksaußen → LA");
assert(parsePosition("Kreisläufer") === "KM", "position: Kreisläufer → KM");
assert(parsePosition("Goalkeeper") === "TW", "position: Goalkeeper → TW");
assert(parsePosition("ailier droit") === "RA", "position: ailier droit → RA");
assert(parsePosition("pivote") === "KM", "position: pivote → KM");
assert(parsePosition("RR (Linkshänder)") === "RR", "position: code with note");
assert(parsePosition("Trainer") === null, "position: unknown stays empty");

// Contract ends
assert(parseContractEnd("2027/28") === "2028-06-30", "contract: season 2027/28");
assert(parseContractEnd("27/28") === "2028-06-30", "contract: season 27/28");
assert(parseContractEnd("30.06.2027") === "2027-06-30", "contract: German date");
assert(parseContractEnd("2027-06-30") === "2027-06-30", "contract: ISO date");
assert(parseContractEnd("06/2028") === "2028-06-30", "contract: month/year");
assert(parseContractEnd("2027") === "2027-06-30", "contract: year only = end of June");
assert(parseContractEnd("46568") === "2027-06-30", "contract: Excel date serial");
assert(parseContractEnd("31.02.2027") === null, "contract: impossible date rejected");
assert(parseContractEnd("irgendwann") === null, "contract: text rejected");

// Whole table, header not in the first row, duplicates and bad rows reported with Excel row numbers
const table = [
  ["Kaderliste"],
  [],
  ["Nr.", "Name", "Vorname", "Position", "Abwehr", "Vertrag bis"],
  ["7", "Müller", "Jonas", "Rückraum rechts / Rechtsaußen", "3/4", "2027/28"],
  ["14", "Sauer", "Ben", "LA", "", "2027"],
  ["", "Ohne", "Position", "", "", "2027"],
  ["5", "Lange", "Max", "RM", "", "?"]
];
const result = parseRosterTable(table, [{ first_name: "ben", last_name: "SAUER" }]);
assert(result.headerFound && result.rows.length === 1, "table: one valid new player");
const row = result.rows[0]?.row;
assert(row?.last_name === "Müller" && row.position === "RR" && row.secondary_positions.join() === "RA" && row.defense_positions.join() === "3,4" && row.jersey_number === 7, "table: fields mapped");
assert(result.rows[0]?.line === 4, "table: Excel row number kept");
assert(result.skipped.map((item) => item.issue).join() === "duplicate,position,contract", "table: duplicate, missing position, bad contract skipped");
assert(!parseRosterTable([["foo", "bar"], ["1", "2"]]).headerFound, "table: no header → nothing imported");

// Full name column ("Nachname, Vorname" and "Vorname Nachname")
const named = parseRosterTable([["Spieler", "Pos.", "Vertrag"], ["Müller, Jonas", "RR", "2027/28"], ["Lena Maria Groß", "KM", "31.12.2027"]]);
assert(named.rows.map((item) => `${item.row.first_name}|${item.row.last_name}`).join() === "Jonas|Müller,Lena Maria|Groß", "table: full-name column split");

// CSV with semicolons and quotes
const csv = readCsv('Vorname;Nachname;Position;Vertrag\r\n"Jonas";"Müller; Jr.";RR;2027\r\n');
assert(csv[1][1] === "Müller; Jr.", "csv: quoted delimiter");

// XLSX round trip through our own writer
const xlsx = createXlsxWorkbook([["Vorname", "Nachname", "Position", "Vertrag bis"], ["Jonas", "Müller", "RR", "2027/28"]], "Kader");
const read = readTableFile(xlsx, "kader.xlsx");
assert(read[1]?.join("|") === "Jonas|Müller|RR|2027/28", "xlsx: reads what the writer wrote");

// Server-side recheck
assert(validImportRow({ first_name: "A", last_name: "B", position: "XX", contract_until: "2027-06-30" }) === null, "recheck: bad position rejected");
assert(validImportRow({ first_name: "A", last_name: "B", position: "RR", contract_until: "2027-06-30", secondary_positions: ["RR", "RA"], defense_positions: [9, 3] })?.secondary_positions.join() === "RA", "recheck: cleans lists");
