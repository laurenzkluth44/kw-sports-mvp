// Unit tests for KW player profile freshness. Run: node --experimental-strip-types scripts/tests/freshness.test.ts
import { playerFreshness } from "../../src/features/kw-players/freshness.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };
const now = new Date("2026-11-01T12:00:00Z");
const base = { updated_at: "2026-10-20T10:00:00Z", contract_until: "2028-06-30", available_from: null };

assert(!playerFreshness(base, now).stale, "recent profile with running contract is fresh");
assert(playerFreshness({ ...base, updated_at: "2026-07-01T10:00:00Z" }, now).stale, "untouched for 120 days is stale");
const expired = playerFreshness({ ...base, updated_at: "2026-05-01T10:00:00Z", contract_until: "2026-06-30" }, now);
assert(expired.stale && expired.reason === "contract", "contract ran out after the last update");
assert(
  !playerFreshness({ ...base, updated_at: "2026-10-01T10:00:00Z", contract_until: "2026-06-30" }, now).stale,
  "contract already over when last updated (player known to be free) is fresh"
);
assert(
  !playerFreshness({ ...base, updated_at: "2026-10-01T10:00:00Z", contract_until: "2026-06-30", available_from: "2026-07-01" }, now).stale,
  "newer availability date after contract end is fresh"
);
assert(!playerFreshness({ ...base, contract_until: null }, now).stale, "no contract date and recent update is fresh");
