// Club onboarding checklist. Run: node --experimental-strip-types scripts/tests/onboarding.test.ts
import { onboardingSteps, showOnboarding } from "../../src/features/club/onboarding-model.ts";

const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else console.log("ok  ", m); };
const state = (s: ReturnType<typeof onboardingSteps>) => s.map((x) => x.state).join(",");

const fresh = onboardingSteps({ rosterCount: 0, needCount: 0, openSuggestions: 0, answeredSuggestions: 0 });
assert(state(fresh) === "done,todo,todo,waiting", "new club: access done, squad and need open, answers waiting");
assert(showOnboarding(fresh, false), "new club sees the checklist");
assert(!showOnboarding(fresh, true), "hidden checklist stays hidden");

const setUp = onboardingSteps({ rosterCount: 12, needCount: 1, openSuggestions: 0, answeredSuggestions: 0 });
assert(!showOnboarding(setUp, false), "squad + need done and nothing to answer: checklist disappears");

const suggestion = onboardingSteps({ rosterCount: 12, needCount: 1, openSuggestions: 1, answeredSuggestions: 0 });
assert(state(suggestion) === "done,done,done,todo" && showOnboarding(suggestion, false), "first suggestion brings back the last step");

const answered = onboardingSteps({ rosterCount: 12, needCount: 1, openSuggestions: 2, answeredSuggestions: 1 });
assert(!showOnboarding(answered, false), "after the first answer the checklist is gone for good");
