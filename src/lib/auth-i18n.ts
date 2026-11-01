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
  noAccess: string;
  mobileSubtitle: string;
  portal: string;
  title: string;
  subtitle: string;
  email: string;
  password: string;
  submit: string;
  forgot: string;
  passwordChanged: string;
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
  show: string;
  hide: string;
  rulesTitle: string;
  ruleLength: string;
  ruleLetter: string;
  ruleNumber: string;
  ruleMatch: string;
  resetTitle: string;
  resetDescription: string;
  arenaEyebrow: string;
  arenaHeadline: string;
  arenaIntro: string;
  arenaSteps: string[];
  resetArenaHeadline: string;
  resetArenaIntro: string;
};

type ForgotCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  email: string;
  submit: string;
  sent: string;
  back: string;
  error: string;
  arenaHeadline: string;
  arenaIntro: string;
};

type ConfirmCopy = {
  inviteTitle: string;
  inviteBody: string;
  inviteButton: string;
  resetTitle: string;
  resetBody: string;
  resetButton: string;
  checking: string;
  failed: string;
  newLink: string;
  toLogin: string;
};

type AuthCopy = { login: LoginCopy; setPassword: SetPasswordCopy; forgot: ForgotCopy; confirm: ConfirmCopy };

export type { ConfirmCopy, ForgotCopy, LoginCopy, SetPasswordCopy };

export const authCopy: Record<AuthLocale, AuthCopy> = {
  de: {
    login: {
      errors: {
        missing: "Bitte E-Mail und Passwort eingeben.",
        invalid: "Die Zugangsdaten stimmen nicht.",
        session: "Die Sitzung konnte nicht erstellt werden.",
        profile: "Für diesen Account fehlt ein Rollenprofil.",
        "missing-club": "Dieser Club User ist keinem Verein zugeordnet.",
        "missing-agency": "Dieser Agency User hat keinen Agency-Namen.",
        invite: "Die Einladung konnte nicht geprüft werden. Bitte öffne den neuesten Einladungslink erneut."
      },
      brand: "KW Sports GmbH · Vereinsplattform",
      headline: "Club Needs",
      intro: "Die Plattform für Kaderplanung und Spielergesuche: Kader verwalten, Lücken früh erkennen und Bedarfe direkt an KW Sports melden.",
      card1Title: "Kaderplanung",
      card1Body: "Spieler, Verträge und Lücken je Saison im Blick.",
      card2Title: "Spielergesuche",
      card2Body: "Bedarfe melden und passende Spieler mit CV direkt von KW Sports erhalten.",
      footer: "Plattform für Vereine und KW Sports",
      noAccess: "Noch kein Zugang? Dein Verein erhält eine Einladung von KW Sports.",
      mobileSubtitle: "Kaderbedarf Datenbank",
      portal: "KW Sports Portal",
      title: "Login",
      subtitle: "Mit E-Mail und Passwort anmelden.",
      email: "E-Mail",
      password: "Passwort",
      submit: "Einloggen",
      forgot: "Passwort vergessen?",
      passwordChanged: "Passwort gespeichert. Du kannst dich jetzt einloggen."
    },
    setPassword: {
      errors: {
        session: "Der Einladungslink ist abgelaufen oder wurde bereits verwendet. Bitte KW Sports um eine neue Einladung.",
        mismatch: "Die Passwörter stimmen nicht überein.",
        short: "Das Passwort erfüllt noch nicht alle Regeln.",
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
      submit: "Passwort speichern",
      show: "Anzeigen",
      hide: "Verbergen",
      rulesTitle: "Dein Passwort",
      ruleLength: "Mindestens 10 Zeichen",
      ruleLetter: "Mindestens ein Buchstabe",
      ruleNumber: "Mindestens eine Zahl",
      ruleMatch: "Beide Eingaben stimmen überein",
      resetTitle: "Neues Passwort",
      resetDescription: "Wähle ein neues Passwort für deinen KW Sports Zugang.",
      arenaEyebrow: "Willkommen bei KW Sports",
      arenaHeadline: "Los geht's",
      arenaIntro: "Dein Verein ist bei Club Needs freigeschaltet. In drei Schritten bist du startklar:",
      arenaSteps: ["Passwort festlegen", "Kader eintragen und Lücken sehen", "Bedarf melden und Spielervorschläge erhalten"],
      resetArenaHeadline: "Neues Passwort",
      resetArenaIntro: "Kurz ein neues Passwort festlegen, dann geht es direkt weiter in Club Needs."
    },
    forgot: {
      eyebrow: "KW Sports Portal",
      title: "Passwort vergessen",
      subtitle: "Gib deine E-Mail ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst.",
      email: "E-Mail",
      submit: "Link senden",
      sent: "Wenn es für diese E-Mail einen Zugang gibt, ist der Link unterwegs. Bitte schau auch im Spam-Ordner nach.",
      back: "Zurück zum Login",
      error: "Das hat nicht geklappt. Bitte versuche es in ein paar Minuten erneut.",
      arenaHeadline: "Kein Problem",
      arenaIntro: "Ein Link per E-Mail, ein neues Passwort, fertig. Dein Kader und deine Bedarfe bleiben unverändert."
    },
    confirm: {
      inviteTitle: "Einladung annehmen",
      inviteBody: "KW Sports hat dich zu Club Needs eingeladen. Im nächsten Schritt legst du dein Passwort fest.",
      inviteButton: "Zugang einrichten",
      resetTitle: "Passwort zurücksetzen",
      resetBody: "Du hast einen neuen Passwort-Link angefordert. Im nächsten Schritt legst du dein neues Passwort fest.",
      resetButton: "Weiter",
      checking: "Link wird geprüft...",
      failed: "Der Link ist abgelaufen oder wurde schon verwendet. Fordere einen neuen an oder melde dich bei KW Sports.",
      newLink: "Neuen Link anfordern",
      toLogin: "Zum Login"
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
        "missing-agency": "This agency user is missing an agency name.",
        invite: "The invite could not be verified. Please open the newest invitation link again."
      },
      brand: "KW Sports GmbH · Club Platform",
      headline: "Club Needs",
      intro: "The platform for squad planning and player requests: manage your squad, spot gaps early and send needs straight to KW Sports.",
      card1Title: "Squad planning",
      card1Body: "Players, contracts and gaps per season at a glance.",
      card2Title: "Player requests",
      card2Body: "Report needs and get matching players with CV straight from KW Sports.",
      footer: "Platform for clubs and KW Sports",
      noAccess: "No access yet? Your club receives an invitation from KW Sports.",
      mobileSubtitle: "Club Needs Database",
      portal: "KW Sports Portal",
      title: "Login",
      subtitle: "Sign in with your email and password.",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      forgot: "Forgot password?",
      passwordChanged: "Password saved. You can sign in now."
    },
    setPassword: {
      errors: {
        session: "This invitation link has expired or was already used. Please ask KW Sports for a new invitation.",
        mismatch: "The passwords do not match.",
        short: "The password doesn't meet all rules yet.",
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
      submit: "Save password",
      show: "Show",
      hide: "Hide",
      rulesTitle: "Your password",
      ruleLength: "At least 10 characters",
      ruleLetter: "At least one letter",
      ruleNumber: "At least one number",
      ruleMatch: "Both entries match",
      resetTitle: "New password",
      resetDescription: "Choose a new password for your KW Sports access.",
      arenaEyebrow: "Welcome to KW Sports",
      arenaHeadline: "Let's go",
      arenaIntro: "Your club is set up on Club Needs. Three steps and you're ready:",
      arenaSteps: ["Set your password", "Add your squad and see the gaps", "Report a need and get player suggestions"],
      resetArenaHeadline: "New password",
      resetArenaIntro: "Set a new password and you're straight back in Club Needs."
    },
    forgot: {
      eyebrow: "KW Sports Portal",
      title: "Forgot password",
      subtitle: "Enter your email. We'll send you a link to set a new password.",
      email: "Email",
      submit: "Send link",
      sent: "If there's an account for this email, the link is on its way. Please check your spam folder too.",
      back: "Back to login",
      error: "That didn't work. Please try again in a few minutes.",
      arenaHeadline: "No problem",
      arenaIntro: "One link by email, one new password, done. Your squad and needs stay as they are."
    },
    confirm: {
      inviteTitle: "Accept invitation",
      inviteBody: "KW Sports invited you to Club Needs. Next, you'll set your password.",
      inviteButton: "Set up access",
      resetTitle: "Reset password",
      resetBody: "You requested a new password link. Next, you'll set your new password.",
      resetButton: "Continue",
      checking: "Checking link...",
      failed: "This link has expired or was already used. Request a new one or contact KW Sports.",
      newLink: "Request a new link",
      toLogin: "Go to login"
    }
  }
};
