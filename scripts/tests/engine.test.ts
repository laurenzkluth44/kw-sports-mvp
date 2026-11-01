// Unit tests for the matching engine. Run: node --experimental-strip-types scripts/tests/engine.test.ts
// (Node strips the types; no extra test framework needed.)
import { scorePlayerForNeed, rankPlayersForNeed } from "../../src/features/matching/engine.ts";
const base = { kind:"spieler", first_name:"A", last_name:"A", birth_date:null, nationality:null, attack_positions:[], defense_positions:[], coach_roles:[], handedness:null, height_cm:null, current_club:null, current_league:null, contract_until:null, available_from:null, languages:[], player_types:[], league_experience:null, profile:null, video_url:null, photo_path:null, cv_path:null, consent_at:null, visible_to_clubs:true, created_at:"", updated_at:"", id:"x" } as any;
const need = { need_type:"spieler", attack_positions:["RR"], defense_positions:[], coach_role:null, needed_from_date:"2027-07-01", age_min:22, age_max:28, height_min:190, languages:["de"], player_types:["wurfstark"], league_experience:"2. Bundesliga" } as any;
const perfect = { ...base, last_name:"Perfect", attack_positions:["RR","RA"], birth_date:"2002-03-01", height_cm:194, contract_until:"2027-06-30", languages:["de","en"], player_types:["wurfstark"], current_league:"2. Bundesliga" };
const wrongPos = { ...base, last_name:"Wrong", attack_positions:["LA"] };
const unknown = { ...base, last_name:"Unknown", attack_positions:["RR"] };
const tooOld = { ...perfect, last_name:"Old", birth_date:"1990-01-01", contract_until:"2028-06-30" };
const coach = { ...base, kind:"trainer", last_name:"Coach", coach_roles:["co_trainer"] };
const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };
const p = scorePlayerForNeed(need, perfect);
assert(p.eligible && p.score === 100, `perfect fit scores 100 (got ${p.score})`);
assert(!scorePlayerForNeed(need, wrongPos).eligible, "wrong position is not suggested");
const u = scorePlayerForNeed(need, unknown);
assert(u.eligible && u.score > 0 && u.score < 100 && u.reasons.some(r => r.ok === null), `unknown data counts half (got ${u.score})`);
const o = scorePlayerForNeed(need, tooOld);
assert(o.eligible && o.score < p.score && o.reasons.find(r=>r.key==="age")?.ok === false && o.reasons.find(r=>r.key==="availability")?.ok === false, `too old + under contract ranks lower (got ${o.score})`);
assert(!scorePlayerForNeed(need, coach).eligible, "coach not suggested for player need");
const coachNeed = { ...need, need_type:"trainer", attack_positions:[], coach_role:"co_trainer", age_min:null, age_max:null, height_min:null, player_types:[], languages:[], league_experience:null };
assert(scorePlayerForNeed(coachNeed, coach).eligible, "coach with the role is suggested for coach need");
assert(!scorePlayerForNeed({ ...coachNeed, coach_role:"cheftrainer" }, coach).eligible, "coach without the role is not suggested");
const defNeed = { ...need, attack_positions:[], defense_positions:[3,4] };
assert(scorePlayerForNeed(defNeed, { ...base, defense_positions:[4] }).reasons[0].value === "A4", "defence position match is labelled A4");
const ranked = rankPlayersForNeed(need, [unknown, wrongPos, tooOld, perfect]);
assert(ranked.map(r=>r.player.last_name).join(",") === "Perfect,Old,Unknown" || ranked[0].player.last_name === "Perfect", `ranking: ${ranked.map(r=>r.player.last_name+":"+r.score).join(", ")}`);

// ---- password rules (shared with the set-password form)
import { isAcceptablePassword, passwordChecks } from "../../src/lib/password-rules.ts";
assert(!isAcceptablePassword("kurz1", "kurz1"), "password: too short is rejected");
assert(!isAcceptablePassword("nurbuchstabenlang", "nurbuchstabenlang"), "password: needs a number");
assert(!isAcceptablePassword("1234567890", "1234567890"), "password: needs a letter");
assert(!isAcceptablePassword("Handball2027", "Handball2028"), "password: entries must match");
assert(isAcceptablePassword("Handball2027", "Handball2027"), "password: good password accepted");
assert(passwordChecks("Äöü1234567", "").letter, "password: umlauts count as letters");
