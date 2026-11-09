import type { ClubLocale } from "@/lib/club-i18n";

/**
 * Imprint and privacy policy live on kwsports.de. They must be reachable from every page,
 * including the login page. Override with NEXT_PUBLIC_IMPRINT_URL / NEXT_PUBLIC_PRIVACY_URL if they move.
 */
export const LEGAL_URLS = {
  imprint: process.env.NEXT_PUBLIC_IMPRINT_URL || "https://www.kwsports.de/impressum",
  privacy: process.env.NEXT_PUBLIC_PRIVACY_URL || "https://www.kwsports.de/datenschutz"
};

export const legalLabels: Record<ClubLocale, { imprint: string; privacy: string }> = {
  de: { imprint: "Impressum", privacy: "Datenschutz" },
  en: { imprint: "Imprint", privacy: "Privacy" },
  fr: { imprint: "Mentions légales", privacy: "Confidentialité" },
  es: { imprint: "Aviso legal", privacy: "Privacidad" }
};
