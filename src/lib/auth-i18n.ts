import { CLUB_LOCALE_COOKIE } from "@/lib/club-i18n";

// Auth screens (login + set-password) are bilingual: German (default) and English.
// They reuse the same locale cookie as the rest of the app, so a club user's
// chosen language carries over. fr/es fall back to German here.
export const AUTH_LOCALES = ["de", "en"] as const;
export type AuthLocale = (typeof AUTH_LOCALES)[number];

export const AUTH_LOCALE_LABELS: Record<AuthLocale, string> = { de: "DE", en: "EN" };
export const AUTH_LOCALE_COOKIE = CLUB_LOCALE_COOKIE;

export function parseAuthLocale(value: string | undefined | null): AuthLocale {
  return value === "en" ? "en" : "de";
}

type LoginCopy = {
  errors: Record<string, string>;
  brand: string;
  headline: string;
  intro: string;
  card1Title: string;
  card1Body: string;
  card2Title: string;
  card2Body: string;
  footer: string;
  mobileSubtitle: string;
  portal: string;
  title: string;
  subtitle: string;
  email: string;
  password: string;
  submit: string;
};

type SetPasswordCopy = {
  errors: Record<string, string>;
  access: string;
  welcome: string;
  title: string;
  description: string;
  checking: string;
  newPassword: string;
  repeatPassword: string;
  submit: string;
};

type AuthCopy = { login: LoginCopy; setPassword: SetPasswordCopy };

export type { LoginCopy, SetPasswordCopy };

export const authCopy: Record<AuthLocale, AuthCopy> = {
  de: {
    login: {
      errors: {
        missing: "Bitte E-Mail und Passwort eingeben.",
        invalid: "Die Zugangsdaten stimmen nicht.",
        session: "Die Sitzung konnte nicht erstellt werden.",
        profile: "Für diesen Account fehlt ein Rollenprofil.",
        "missing-club": "Dieser Club User ist keinem Verein zugeordnet.",
        "missing-agency": "Dieser Agency User hat keinen Agency-Namen."
      },
      brand: "KW Sports GmbH · Vereinsplattform",
      headline: "Club Needs Database",
      intro: "Eine ruhige, zentrale Arbeitsfläche für Kaderbedarfe nach Verein, Liga, Saison, Position und Status.",
      card1Title: "Zentrale Datenbasis",
      card1Body: "Alle Club-Bedarfe sauber in Supabase gesichert.",
      card2Title: "Rollenbasiert geschützt",
      card2Body: "Clubs sehen eigene Daten, Agencies lesen die Gesamtübersicht, Admins steuern die Plattform.",
      footer: "Plattform für Vereine und KW Sports",
      mobileSubtitle: "Kaderbedarf Datenbank",
      portal: "KW Sports Portal",
      title: "Login",
      subtitle: "Mit E-Mail und Passwort anmelden.",
      email: "E-Mail",
      password: "Passwort",
      submit: "Einloggen"
    },
    setPassword: {
      errors: {
        session: "Der Einladungslink ist abgelaufen oder wurde bereits verwendet. Bitte KW Sports um eine neue Einladung.",
        mismatch: "Die Passwörter stimmen nicht überein.",
        short: "Bitte wähle ein Passwort mit mindestens 8 Zeichen.",
        invite: "Einladung konnte nicht aktiviert werden. Bitte Link erneut öffnen oder neue Einladung anfordern.",
        update: "Passwort konnte nicht gesetzt werden. Bitte Link erneut öffnen oder neue Einladung anfordern."
      },
      access: "KW Sports Zugang",
      welcome: "Willkommen",
      title: "Passwort setzen",
      description: "Lege dein Passwort fest, um deinen KW Sports Zugang zu aktivieren.",
      checking: "Einladung wird geprüft...",
      newPassword: "Neues Passwort",
      repeatPassword: "Passwort wiederholen",
      submit: "Passwort speichern"
    }
  },
  en: {
    login: {
      errors: {
        missing: "Please enter your email and password.",
        invalid: "Those credentials don't match.",
        session: "The session could not be created.",
        profile: "This account is missing a role profile.",
        "missing-club": "This club user is not assigned to a club.",
        "missing-agency": "This agency user is missing an agency name."
      },
      brand: "KW Sports GmbH · Club Platform",
      headline: "Club Needs Database",
      intro: "A calm, central workspace for squad needs by club, league, season, position and status.",
      card1Title: "Central database",
      card1Body: "All club needs stored securely in Supabase.",
      card2Title: "Role-based access",
      card2Body: "Clubs see their own data, agencies read the full overview, admins control the platform.",
      footer: "Platform for clubs and KW Sports",
      mobileSubtitle: "Club Needs Database",
      portal: "KW Sports Portal",
      title: "Login",
      subtitle: "Sign in with your email and password.",
      email: "Email",
      password: "Password",
      submit: "Sign in"
    },
    setPassword: {
      errors: {
        session: "This invitation link has expired or was already used. Please ask KW Sports for a new invitation.",
        mismatch: "The passwords do not match.",
        short: "Please choose a password with at least 8 characters.",
        invite: "The invitation could not be activated. Please reopen the link or request a new invitation.",
        update: "The password could not be set. Please reopen the link or request a new invitation."
      },
      access: "KW Sports Access",
      welcome: "Welcome",
      title: "Set password",
      description: "Choose your password to activate your KW Sports access.",
      checking: "Checking invitation...",
      newPassword: "New password",
      repeatPassword: "Repeat password",
      submit: "Save password"
    }
  }
};
