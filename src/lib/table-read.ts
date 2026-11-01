import { inflateRawSync } from "node:zlib";

/**
 * Reads the first sheet of an .xlsx file, or a .csv file, into rows of strings.
 * Server-only (uses zlib); no dependency. Handles shared strings, inline strings,
 * numbers and booleans. Dates stay as Excel serial numbers ("46568"); the import
 * parser converts them.
 */
export function readTableFile(buffer: Buffer, fileName: string): string[][] {
  const isZip = buffer.length > 4 && buffer.readUInt32LE(0) === 0x04034b50;
  if (isZip) return readXlsx(buffer);
  // Old binary .xls (OLE container) can't be read; the caller asks for .xlsx or .csv.
  const isOle = buffer.length > 8 && buffer.readUInt32LE(0) === 0xe011cfd0;
  if (isOle || /\.xls$/i.test(fileName)) throw new Error("legacy xls");
  return readCsv(decodeText(buffer));
}

function decodeText(buffer: Buffer) {
  // UTF-8 with or without BOM; fall back to Windows-1252 (Excel "CSV" on Windows) when UTF-8 is invalid.
  const utf8 = buffer.toString("utf8").replace(/^﻿/, "");
  if (!utf8.includes("�")) return utf8;
  return new TextDecoder("windows-1252").decode(buffer);
}

// ---------------------------------------------------------------- CSV

export function readCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [";", ",", "\t"].sort((a, b) => count(firstLine, b) - count(firstLine, a))[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  // Empty lines are kept so line numbers match what the club sees in Excel.
  return rows.map((cells) => cells.map((value) => value.trim()));
}

function count(text: string, char: string) {
  return text.split(char).length - 1;
}

// ---------------------------------------------------------------- XLSX (zip + XML)

function unzip(buffer: Buffer) {
  // Find the end-of-central-directory record, then walk the central directory.
  let eocd = -1;
  for (let index = buffer.length - 22; index >= Math.max(0, buffer.length - 65557); index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) throw new Error("not a zip file");

  const entries = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const files = new Map<string, Buffer>();

  for (let entry = 0; entry < entries; entry += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);
    offset += 46 + nameLength + extraLength + commentLength;

    if (!/^xl\/(sharedStrings\.xml|workbook\.xml|worksheets\/sheet\d+\.xml|_rels\/workbook\.xml\.rels)$/.test(name)) continue;
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const data = buffer.subarray(start, start + compressedSize);
    if (method === 0) files.set(name, Buffer.from(data));
    else if (method === 8) files.set(name, inflateRawSync(data));
  }
  return files;
}

function xmlText(value: string) {
  return value
    .replace(/<rPh[\s\S]*?<\/rPh>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");
}

function columnIndex(reference: string) {
  const letters = reference.replace(/\d+$/, "");
  let index = 0;
  for (const letter of letters) index = index * 26 + (letter.charCodeAt(0) - 64);
  return index - 1;
}

function firstSheetPath(files: Map<string, Buffer>) {
  const workbook = files.get("xl/workbook.xml")?.toString("utf8") ?? "";
  const rels = files.get("xl/_rels/workbook.xml.rels")?.toString("utf8") ?? "";
  const firstSheetId = /<sheet\b[^>]*\br:id="([^"]+)"/.exec(workbook)?.[1];
  if (firstSheetId) {
    const target = new RegExp(`<Relationship\\b[^>]*Id="${firstSheetId}"[^>]*Target="([^"]+)"`).exec(rels)?.[1]
      ?? new RegExp(`<Relationship\\b[^>]*Target="([^"]+)"[^>]*Id="${firstSheetId}"`).exec(rels)?.[1];
    if (target) {
      const path = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
      if (files.has(path)) return path;
    }
  }
  return [...files.keys()].filter((name) => name.startsWith("xl/worksheets/")).sort()[0];
}

export function readXlsx(buffer: Buffer): string[][] {
  const files = unzip(buffer);
  const shared = [...(files.get("xl/sharedStrings.xml")?.toString("utf8") ?? "").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
    xmlText(match[1])
  );
  const sheetPath = firstSheetPath(files);
  const sheet = sheetPath ? files.get(sheetPath)?.toString("utf8") ?? "" : "";

  const rows: string[][] = [];
  for (const rowMatch of sheet.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = [];
    let next = 0;
    for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attributes = cellMatch[1];
      const inner = cellMatch[2] ?? "";
      const reference = /\br="([A-Z]+\d+)"/.exec(attributes)?.[1];
      const index = reference ? columnIndex(reference) : next;
      const type = /\bt="([^"]+)"/.exec(attributes)?.[1];
      const raw = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1];
      let value = "";
      if (type === "s" && raw !== undefined) value = shared[Number(raw)] ?? "";
      else if (type === "inlineStr") value = xmlText(/<is>([\s\S]*?)<\/is>/.exec(inner)?.[1] ?? "");
      else if (type === "b") value = raw === "1" ? "TRUE" : "FALSE";
      else if (raw !== undefined) value = xmlText(raw);
      while (cells.length < index) cells.push("");
      cells[index] = value.trim();
      next = index + 1;
    }
    // Keep the spreadsheet's row numbers (r="5" is index 4), so messages can say "Zeile 5".
    const rowNumber = Number(/\br="(\d+)"/.exec(rowMatch[1])?.[1] ?? rows.length + 1);
    while (rows.length < rowNumber - 1) rows.push([]);
    rows.push(cells);
  }
  return rows;
}
