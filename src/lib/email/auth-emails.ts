import type { AuthLocale } from "@/lib/auth-i18n";
import { renderEmail } from "@/lib/email/template";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Branded invitation and password emails. The link points to our own /auth/confirm page with a
 * token hash; the token is only used when the person clicks the button there, so mail scanners
 * that open links can't burn the one-time token.
 */
export function authConfirmLink(tokenHash: string, type: "invite" | "recovery", next: string, site = getSiteUrl()) {
  const params = new URLSearchParams({ token_hash: tokenHash, type, next });
  return `${site}/auth/confirm?${params.toString()}`;
}

const inviteCopy = {
  de: {
    subject: (org: string) => `Dein Zugang zu KW Club Hub${org ? ` · ${org}` : ""}`,
    eyebrow: "Einladung",
    title: "Willkommen bei KW Club Hub",
    intro: (name: string, org: string) =>
      `Hallo ${name}, KW Sports hat ${org ? `dich für ${org}` : "dich"} zu KW Club Hub eingeladen: der Plattform für Kaderplanung und Spielergesuche. Lege jetzt dein Passwort fest.`,
    steps: "Schritt",
    step1: "Passwort festlegen",
    step2: "Kader eintragen und Lücken sehen",
    step3: "Bedarf melden, passende Spieler mit CV erhalten",
    cta: "Zugang einrichten",
    outro: "Der Link ist 24 Stunden gültig. Abgelaufen? Melde dich kurz bei KW Sports, wir schicken einen neuen.",
    footer: "KW Sports GmbH · kwsports.de · Du bekommst diese E-Mail, weil KW Sports dich eingeladen hat."
  },
  en: {
    subject: (org: string) => `Your access to KW Club Hub${org ? ` · ${org}` : ""}`,
    eyebrow: "Invitation",
    title: "Welcome to KW Club Hub",
    intro: (name: string, org: string) =>
      `Hi ${name}, KW Sports invited you${org ? ` for ${org}` : ""} to KW Club Hub: the platform for squad planning and player requests. Set your password now.`,
    steps: "Step",
    step1: "Set your password",
    step2: "Add your squad and see the gaps",
    step3: "Report a need, get matching players with CV",
    cta: "Set up access",
    outro: "The link is valid for 24 hours. Expired? Let KW Sports know and we'll send a new one.",
    footer: "KW Sports GmbH · kwsports.de · You receive this email because KW Sports invited you."
  }
} as const;

export function buildInviteEmail(
  input: { name: string; organisation: string | null; link: string; locale: AuthLocale },
  site = getSiteUrl()
) {
  const t = inviteCopy[input.locale];
  const org = input.organisation ?? "";
  const { html, text } = renderEmail(
    {
      preheader: t.intro(input.name, org),
      eyebrow: t.eyebrow,
      title: t.title,
      intro: t.intro(input.name, org),
      rows: [
        { label: `${t.steps} 1`, value: t.step1 },
        { label: `${t.steps} 2`, value: t.step2 },
        { label: `${t.steps} 3`, value: t.step3 }
      ],
      cta: { label: t.cta, href: input.link },
      outro: t.outro,
      footer: t.footer
    },
    site
  );
  return { subject: t.subject(org), html, text };
}

const resetCopy = {
  de: {
    subject: "Neues Passwort für KW Club Hub",
    eyebrow: "Passwort",
    title: "Neues Passwort festlegen",
    intro: "Du hast einen Link zum Zurücksetzen deines Passworts angefordert. Klicke auf den Button und lege ein neues Passwort fest.",
    cta: "Neues Passwort festlegen",
    outro: "Du hast das nicht angefordert? Dann ignoriere diese E-Mail einfach, dein Passwort bleibt unverändert.",
    footer: "KW Sports GmbH · kwsports.de"
  },
  en: {
    subject: "New password for KW Club Hub",
    eyebrow: "Password",
    title: "Set a new password",
    intro: "You requested a link to reset your password. Click the button and choose a new password.",
    cta: "Set new password",
    outro: "Didn't request this? Just ignore this email, your password stays the same.",
    footer: "KW Sports GmbH · kwsports.de"
  }
} as const;

export function buildResetEmail(input: { link: string; locale: AuthLocale }, site = getSiteUrl()) {
  const t = resetCopy[input.locale];
  const { html, text } = renderEmail(
    { preheader: t.intro, eyebrow: t.eyebrow, title: t.title, intro: t.intro, cta: { label: t.cta, href: input.link }, outro: t.outro, footer: t.footer },
    site
  );
  return { subject: t.subject, html, text };
}
