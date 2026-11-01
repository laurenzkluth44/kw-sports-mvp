/**
 * Branded KW Sports email: white header with logo, black title band, facts table, one blue button.
 * Table layout + inline styles so it renders in Outlook, Gmail and Apple Mail. Pure function (no I/O).
 */
export type EmailContent = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  rows?: { label: string; value: string }[];
  quote?: string | null;
  cta: { label: string; href: string };
  outro?: string;
  footer: string;
};

const INK = "#0A0A0A";
const BLUE = "#0055FF";
const FONT = "'Outfit','Helvetica Neue',Helvetica,Arial,sans-serif";
const DISPLAY = "'Bebas Neue','Arial Narrow','Helvetica Neue',Arial,sans-serif";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderEmail(content: EmailContent, siteUrl: string) {
  const e = escapeHtml;
  const rows = (content.rows ?? [])
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;font:700 11px/1.4 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:#6B7280;width:38%;vertical-align:top">${e(row.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;font:600 15px/1.4 ${FONT};color:${INK};vertical-align:top">${e(row.value)}</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${e(content.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F3F4F6">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${e(content.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6">
<tr><td align="center" style="padding:32px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF">
    <tr><td style="padding:28px 32px 22px">
      <a href="${e(siteUrl)}" style="text-decoration:none"><img src="${e(siteUrl)}/kw-sports-logo.png" width="120" height="39" alt="KW Sports" style="display:block;border:0"></a>
    </td></tr>
    <tr><td style="background:${INK};padding:28px 32px;border-left:4px solid ${BLUE}">
      <p style="margin:0 0 8px;font:700 11px/1.2 ${FONT};letter-spacing:.2em;text-transform:uppercase;color:#7FA6FF">${e(content.eyebrow)}</p>
      <h1 style="margin:0;font:400 38px/1 ${DISPLAY};letter-spacing:.01em;text-transform:uppercase;color:#FFFFFF">${e(content.title)}</h1>
    </td></tr>
    <tr><td style="padding:28px 32px 8px">
      <p style="margin:0 0 20px;font:400 16px/1.6 ${FONT};color:#374151">${e(content.intro)}</p>
      ${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${rows}</table>` : ""}
      ${
        content.quote
          ? `<p style="margin:0 0 24px;padding:4px 0 4px 14px;border-left:3px solid ${BLUE};font:italic 400 15px/1.6 ${FONT};color:#374151">„${e(content.quote)}“</p>`
          : ""
      }
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr>
        <td style="background:${BLUE}"><a href="${e(content.cta.href)}" style="display:inline-block;padding:15px 26px;font:700 13px/1 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:#FFFFFF;text-decoration:none">${e(content.cta.label)} &rarr;</a></td>
      </tr></table>
      ${content.outro ? `<p style="margin:0 0 24px;font:400 14px/1.6 ${FONT};color:#6B7280">${e(content.outro)}</p>` : ""}
    </td></tr>
    <tr><td style="padding:18px 32px 26px;border-top:1px solid #E5E7EB">
      <p style="margin:0;font:400 12px/1.6 ${FONT};color:#9CA3AF">${e(content.footer)}</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    content.title,
    "",
    content.intro,
    "",
    ...(content.rows ?? []).map((row) => `${row.label}: ${row.value}`),
    content.quote ? `\n„${content.quote}“` : "",
    "",
    `${content.cta.label}: ${content.cta.href}`,
    content.outro ? `\n${content.outro}` : "",
    "",
    "—",
    content.footer
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  return { html, text };
}
