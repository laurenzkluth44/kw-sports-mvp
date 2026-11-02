// Unit tests for assigning bulk-uploaded files to players. Run: node --experimental-strip-types scripts/tests/bulk-match.test.ts
import { duplicatesToSkip, matchFile } from "../../src/features/kw-players/bulk-match.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };

const players = [
  { id: "schoss", first_name: "Alexander", last_name: "Schoss" },
  { id: "steinhaus", first_name: "Sören", last_name: "Steinhaus" },
  { id: "krist", first_name: "Luca", last_name: "Krist" },
  { id: "tekaya", first_name: "Yassine", last_name: "Ben Tekaya" },
  { id: "mueller-a", first_name: "Anton", last_name: "Müller" },
  { id: "mueller-b", first_name: "Ben", last_name: "Müller" },
  { id: "hallgren", first_name: "Emil", last_name: "Hallgren" }
];

const cv = matchFile("20261027_KW_CV_Alexander_Schoss_DE.pdf", players);
assert(cv.kind === "cv" && cv.playerId === "schoss" && cv.lang === "de" && cv.stamp === "20261027", "KW CV name");
assert(matchFile("athlete-soeren-steinhaus.jpg", players).playerId === "steinhaus", "website photo with oe for ö");
assert(matchFile("Soren Steinhaus.png", players).playerId === "steinhaus", "ö written as o");
assert(matchFile("krist.webp", players).playerId === "krist", "last name only, unique");
assert(matchFile("20260901_KW_CV_Yassine_Ben_Tekaya.pdf", players).playerId === "tekaya", "two-part last name");
assert(matchFile("mueller.jpg", players).problem === "ambiguous", "shared last name is ambiguous");
assert(matchFile("athlete-ben-mueller.jpg", players).playerId === "mueller-b", "first name decides between namesakes");
assert(matchFile("20260721_KW_CV_Vinzent_Bertl.docx", players).problem === "type", "Word files are not accepted");
assert(matchFile("random.pdf", players).problem === "unmatched", "unknown name");

const files = [
  "20260801_KW_CV_Emil_Hallgren_EN.pdf",
  "20261010_KW_CV_Emil_Hallgren_EN.pdf",
  "20261010_KW_CV_Emil_Hallgren_DE.pdf",
  "athlete-emil-hallgren.jpg"
].map((name) => ({ match: matchFile(name, players), size: 1 }));
const skip = duplicatesToSkip(files);
assert(skip.has(0) && skip.has(1) && !skip.has(2) && !skip.has(3), "newest German CV wins, photo kept");
