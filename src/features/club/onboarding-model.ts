/**
 * Club onboarding checklist on the overview. Derived from real data only, so nothing extra is stored:
 * a step is done as soon as the club has done the thing.
 */
export type OnboardingStepId = "access" | "squad" | "need" | "answer";
export type OnboardingState = "done" | "todo" | "waiting";
export type OnboardingStep = { id: OnboardingStepId; state: OnboardingState };

export function onboardingSteps(input: {
  rosterCount: number;
  /** All needs the club ever created that are still visible (open, in talks, filled). */
  needCount: number;
  openSuggestions: number;
  answeredSuggestions: number;
}): OnboardingStep[] {
  return [
    { id: "access", state: "done" },
    { id: "squad", state: input.rosterCount > 0 ? "done" : "todo" },
    { id: "need", state: input.needCount > 0 ? "done" : "todo" },
    {
      id: "answer",
      state: input.answeredSuggestions > 0 ? "done" : input.openSuggestions > 0 ? "todo" : "waiting"
    }
  ];
}

/** Show the checklist while something is left to do (waiting for KW Sports doesn't count) and the club hasn't hidden it. */
export function showOnboarding(steps: OnboardingStep[], hidden: boolean) {
  return !hidden && steps.some((step) => step.state === "todo");
}

export const ONBOARDING_COOKIE = "kw_onboarding_hidden";
