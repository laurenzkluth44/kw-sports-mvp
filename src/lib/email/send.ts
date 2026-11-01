export type OutgoingEmail = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/** True when branded emails can go out (Resend key set and not disabled). */
export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY?.trim()) && process.env.EMAIL_DISABLED !== "1";
}

/**
 * Sends through Resend's HTTP API (no SDK needed). Without RESEND_API_KEY it only logs,
 * so local runs and previews never email real clubs. Never throws: a failed notification
 * must not break the action that triggered it.
 */
export async function sendEmail(email: OutgoingEmail): Promise<boolean> {
  const to = [...new Set(email.to.map((address) => address.trim().toLowerCase()).filter(Boolean))];
  if (to.length === 0) return false;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "KW Sports <noreply@kwsports.de>";
  if (!apiKey || process.env.EMAIL_DISABLED === "1") {
    console.info(`[email skipped: no RESEND_API_KEY] ${email.subject} → ${to.length} recipient(s)`);
    return false;
  }

  try {
    // One request per recipient so club users never see each other's addresses.
    const results = await Promise.all(
      to.map((address) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: [address],
            subject: email.subject,
            html: email.html,
            text: email.text,
            ...(email.replyTo || process.env.EMAIL_REPLY_TO ? { reply_to: email.replyTo || process.env.EMAIL_REPLY_TO } : {})
          })
        })
      )
    );
    const failed = results.filter((response) => !response.ok);
    if (failed.length > 0) console.error(`[email] ${failed.length}/${results.length} failed: ${email.subject}`, failed[0].status);
    return failed.length === 0;
  } catch (error) {
    console.error("[email] send failed", error);
    return false;
  }
}
