/**
 * Help content model. Pure data (no imports from the app), so the help page and the
 * "Erste Schritte" PDF script render the same text.
 *
 * In steps, [[Label]] marks something the user clicks or sees on screen (shown as a UI chip).
 */
export type ShotKey =
  | "login"
  | "cockpit"
  | "squad"
  | "import"
  | "needForm"
  | "need"
  | "suggestions"
  | "filled"
  | "agency"
  | "adminNeeds"
  | "players"
  | "bulkUpload"
  | "matches"
  | "inbox"
  | "users"
  | "goLive";

export type HelpTopic = {
  id: string;
  title: string;
  /** One line: what this is for. */
  goal: string;
  steps: string[];
  tip?: string;
  shot?: ShotKey;
  /** Part of the compact "Erste Schritte" PDF for clubs. */
  quickstart?: boolean;
};

export type HelpSection = { id: string; title: string; topics: HelpTopic[] };

export type HelpGuide = {
  title: string;
  intro: string;
  sections: HelpSection[];
};

export type HelpChrome = {
  nav: string;
  eyebrow: string;
  contents: string;
  tip: string;
  step: string;
  pdf: string;
  pdfHint: string;
  contact: string;
  screenshotNote: string;
  guides: { club: string; agency: string; admin: string };
};
