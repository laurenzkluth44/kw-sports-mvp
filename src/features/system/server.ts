import { getSiteUrl } from "@/lib/site-url";
import { renderEmail } from "@/lib/email/template";
import { findDomain, senderDomain, DEFAULT_FROM, type GoLiveEnv, type ResendStatus, type ResendDomainRecord } from "./go-live";

const RESEND = "https://api.resend.com";

export function readEnv(): GoLiveEnv {
  return {
    siteUrl: getSiteUrl(),
    explicitSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendKey: process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM,
    emailReplyTo: process.env.EMAIL_REPLY_TO,
    emailDisabled: process.env.EMAIL_DISABLED,
    notifyEmails: process.env.KW_NOTIFY_EMAILS,
    cronSecret: process.env.CRON_SECRET
  };
}

/** Asks Resend whether the sender's domain is verified, and which DNS records it still needs. */
export async function resendStatus(env: GoLiveEnv): Promise<ResendStatus> {
  const key = env.resendKey?.trim();
  if (!key) return { kind: "no_key" };
  const domain = senderDomain(env.emailFrom);
  try {
    const headers = { Authorization: `Bearer ${key}` };
    const list = await fetch(`${RESEND}/domains`, { headers, cache: "no-store" });
    // A "sending access" key may not read domains; that is fine, just not checkable here.
    if (list.status === 401 || list.status === 403) return { kind: "restricted" };
    if (!list.ok) return { kind: "error", message: `Resend antwortet mit ${list.status}.` };
    const body = (await list.json()) as { data?: { id: string; name: string; status: string }[] };
    const match = findDomain(body.data ?? [], domain);
    if (!match) return { kind: "missing", domain };
    let records: ResendDomainRecord[] = [];
    if (match.status !== "verified") {
      const detail = await fetch(`${RESEND}/domains/${match.id}`, { headers, cache: "no-store" });
      if (detail.ok) records = ((await detail.json()) as { records?: ResendDomainRecord[] }).records ?? [];
    }
    return { kind: "domain", domain, status: match.status, records };
  } catch (error) {
    return { kind: "error", message: error instanceof Error ? error.message : "Unbekannter Fehler" };
  }
}

/** Sends the branded test email and returns Resend's own error text, so problems are readable. */
export async function sendTestEmail(to: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, message: "Kein RESEND_API_KEY gesetzt." };
  if (process.env.EMAIL_DISABLED === "1") return { ok: false, message: "EMAIL_DISABLED=1 ist gesetzt." };
  const site = getSiteUrl();
  const { html, text } = renderEmail(
    {
      preheader: "Test aus dem Go-Live-Check",
      eyebrow: "Go-Live-Check",
      title: "Der E-Mail-Versand funktioniert",
      intro: "Diese Test-E-Mail kommt aus KW Club Hub. Wenn du sie liest, können Einladungen, Spielervorschläge und Erinnerungen an Vereine verschickt werden.",
      rows: [
        { label: "Plattform", value: site },
        { label: "Absender", value: process.env.EMAIL_FROM?.trim() || DEFAULT_FROM }
      ],
      cta: { label: "Zum Go-Live-Check", href: `${site}/admin/system` },
      footer: "KW Sports GmbH · kwsports.de · Test-E-Mail, ausgelöst im Admin-Bereich."
    },
    site
  );
  try {
    const response = await fetch(`${RESEND}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM?.trim() || DEFAULT_FROM,
        to: [to],
        subject: "KW Club Hub · Test-E-Mail",
        html,
        text,
        ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {})
      })
    });
    if (response.ok) return { ok: true };
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    return { ok: false, message: body.message ?? `Resend antwortet mit ${response.status}.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unbekannter Fehler" };
  }
}
