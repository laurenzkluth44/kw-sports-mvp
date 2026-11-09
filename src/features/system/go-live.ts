/**
 * Go-live check: turns the server's configuration into a readable checklist. Pure (takes the
 * env and Resend's answer as input), so it is unit-tested and never exposes a secret's value:
 * secrets only report "set" / "missing".
 */

export type CheckState = "ok" | "todo" | "warn" | "info";
export type Check = { id: string; label: string; state: CheckState; value?: string; hint?: string };

export type GoLiveEnv = {
  siteUrl: string;
  explicitSiteUrl?: string;
  productionUrl?: string;
  serviceRoleKey?: string;
  resendKey?: string;
  emailFrom?: string;
  emailReplyTo?: string;
  emailDisabled?: string;
  notifyEmails?: string;
  cronSecret?: string;
};

export type ResendDomainRecord = { record: string; name: string; type: string; value: string; status: string; priority?: number };
export type ResendStatus =
  | { kind: "no_key" }
  | { kind: "restricted" }
  | { kind: "error"; message: string }
  | { kind: "missing"; domain: string }
  | { kind: "domain"; domain: string; status: string; records: ResendDomainRecord[] };

const set = (value: string | undefined) => Boolean(value && value.trim());

export const DEFAULT_FROM = "KW Sports <noreply@kwsports.de>";

/** "KW Sports <noreply@kwsports.de>" → "kwsports.de" */
export function senderDomain(from: string | undefined) {
  const address = (from?.trim() || DEFAULT_FROM).match(/<([^>]+)>/)?.[1] ?? from?.trim() ?? "";
  return address.split("@")[1]?.toLowerCase().trim() ?? "";
}

export function appChecks(env: GoLiveEnv): Check[] {
  const url = env.siteUrl;
  const local = url.startsWith("http://localhost");
  const vercelOnly = !set(env.explicitSiteUrl) && url.endsWith(".vercel.app");
  return [
    {
      id: "url",
      label: "Adresse der Plattform",
      state: local ? "todo" : vercelOnly ? "info" : "ok",
      value: url,
      hint: local
        ? "Auf Vercel NEXT_PUBLIC_SITE_URL setzen."
        : vercelOnly
          ? "Läuft auf der Vercel-Adresse. Für eine eigene Adresse wie clubhub.kwsports.de: Domain in Vercel verbinden und NEXT_PUBLIC_SITE_URL setzen."
          : undefined
    },
    {
      id: "service",
      label: "Supabase Service Role Key",
      state: set(env.serviceRoleKey) ? "ok" : "todo",
      value: set(env.serviceRoleKey) ? "gesetzt" : "fehlt",
      hint: set(env.serviceRoleKey) ? undefined : "Nötig für Einladungen und Passwort-Links. In Vercel als SUPABASE_SERVICE_ROLE_KEY hinterlegen."
    }
  ];
}

export function emailChecks(env: GoLiveEnv, resend: ResendStatus, recipients: string[]): Check[] {
  const domain = senderDomain(env.emailFrom);
  const disabled = env.emailDisabled === "1";
  const checks: Check[] = [
    {
      id: "resend_key",
      label: "Resend API Key",
      state: set(env.resendKey) ? "ok" : "todo",
      value: set(env.resendKey) ? "gesetzt" : "fehlt",
      hint: set(env.resendKey) ? undefined : "Ohne Key gehen keine E-Mails raus (Einladungen, Vorschläge, Antworten, Erinnerungen)."
    },
    {
      id: "sender",
      label: "Absender",
      state: "ok",
      value: env.emailFrom?.trim() || DEFAULT_FROM,
      hint: env.emailFrom?.trim() ? undefined : "Standard. Änderbar über EMAIL_FROM."
    },
    domainCheck(resend, domain),
    {
      id: "notify",
      label: "Benachrichtigungen an KW",
      state: recipients.length ? "ok" : "todo",
      value: recipients.length ? recipients.join(", ") : "niemand",
      hint: set(env.notifyEmails) ? "Aus KW_NOTIFY_EMAILS." : "Alle Admin-Nutzer. Andere Empfänger über KW_NOTIFY_EMAILS (kommagetrennt)."
    },
    {
      id: "reply",
      label: "Antworten auf E-Mails gehen an",
      state: "info",
      value: env.emailReplyTo?.trim() || "Absender (noreply)",
      hint: env.emailReplyTo?.trim() ? undefined : "Empfehlung: EMAIL_REPLY_TO auf eine echte KW-Adresse setzen, damit Antworten von Vereinen ankommen."
    },
    {
      id: "cron",
      label: "Monatliche Erinnerung an Vereine",
      state: set(env.cronSecret) ? "ok" : "todo",
      value: set(env.cronSecret) ? "aktiv (1. des Monats)" : "inaktiv",
      hint: set(env.cronSecret) ? undefined : "CRON_SECRET in Vercel setzen (beliebige lange Zeichenkette), dann läuft sie automatisch."
    }
  ];
  if (disabled) {
    checks.unshift({ id: "disabled", label: "E-Mail-Versand", state: "todo", value: "abgeschaltet", hint: "EMAIL_DISABLED=1 entfernen." });
  }
  return checks;
}

function domainCheck(resend: ResendStatus, domain: string): Check {
  const label = `Domain ${domain || "des Absenders"} bei Resend`;
  switch (resend.kind) {
    case "no_key":
      return { id: "domain", label, state: "todo", value: "nicht prüfbar", hint: "Erst den Resend API Key setzen." };
    case "restricted":
      return { id: "domain", label, state: "warn", value: "nicht prüfbar", hint: "Der Key darf nur senden. Status bitte in Resend unter Domains prüfen, oder mit der Test-E-Mail unten." };
    case "error":
      return { id: "domain", label, state: "warn", value: "Resend nicht erreichbar", hint: resend.message };
    case "missing":
      return { id: "domain", label, state: "todo", value: "nicht angelegt", hint: `In Resend unter Domains „${resend.domain}“ hinzufügen und die DNS-Einträge beim Domain-Anbieter eintragen.` };
    case "domain":
      return resend.status === "verified"
        ? { id: "domain", label, state: "ok", value: "verifiziert" }
        : {
            id: "domain",
            label,
            state: "todo",
            value: resend.status === "failed" ? "Prüfung fehlgeschlagen" : "wartet auf DNS",
            hint: "Die DNS-Einträge unten beim Domain-Anbieter von kwsports.de eintragen. Die Prüfung dauert danach meist Minuten, selten bis zu 72 Stunden."
          };
  }
}

/** Picks the sender's domain from Resend's GET /domains answer. */
export function findDomain(list: { id: string; name: string; status: string }[], domain: string) {
  return list.find((entry) => entry.name.toLowerCase() === domain) ?? null;
}

/** URLs to paste into Supabase › Authentication › URL Configuration. */
export function supabaseAuthUrls(siteUrl: string) {
  return {
    siteUrl,
    redirects: [`${siteUrl}/auth/confirm`, `${siteUrl}/auth/callback`, `${siteUrl}/set-password`]
  };
}

export function summary(checks: Check[]) {
  const todo = checks.filter((check) => check.state === "todo").length;
  const warn = checks.filter((check) => check.state === "warn").length;
  return { todo, warn, ready: todo === 0 };
}
