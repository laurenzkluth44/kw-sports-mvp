import { needHeadline } from "@/features/player-needs/need-summary";
import type { ClubLocale } from "@/lib/club-i18n";
import { renderEmail } from "@/lib/email/template";
import { sendEmail } from "@/lib/email/send";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { Club, KwPlayer, NeedMatch, PlayerNeed } from "@/types/domain";

/**
 * Event emails. Called after the user's action has succeeded (via next/server `after`), they read
 * what they need with the service role, so a club user's action can notify KW and vice versa.
 * Every function swallows its own errors.
 */

const PRIORITY_DE: Record<string, string> = { hoch: "Hoch", mittel: "Mittel", niedrig: "Niedrig" };

/** Club emails go out in the club's language; there is no per-user language stored. */
export function clubEmailLocale(country: string | null | undefined): ClubLocale {
  if (!country) return "de";
  if (["Deutschland", "Österreich", "Schweiz"].includes(country)) return "de";
  if (country === "Frankreich") return "fr";
  if (country === "Spanien") return "es";
  return "en";
}

function adminClientOrNull() {
  try {
    return createSupabaseAdminClient();
  } catch {
    console.info("[email skipped: no SUPABASE_SERVICE_ROLE_KEY]");
    return null;
  }
}

type AdminClient = NonNullable<ReturnType<typeof adminClientOrNull>>;

async function kwRecipients(admin: AdminClient) {
  const configured = (process.env.KW_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  if (configured.length > 0) return configured;
  const { data } = await admin.from("users").select("email").eq("role", "admin");
  return (data ?? []).map((row) => row.email as string);
}

async function clubRecipients(admin: AdminClient, clubId: string) {
  const { data } = await admin.from("users").select("email").eq("role", "club").eq("club_id", clubId);
  return (data ?? []).map((row) => row.email as string);
}

async function loadNeed(admin: AdminClient, needId: string) {
  const { data } = await admin.from("player_needs").select("*, clubs(*)").eq("id", needId).maybeSingle();
  return data as (PlayerNeed & { clubs: Club }) | null;
}

async function safely(label: string, run: () => Promise<void>) {
  try {
    await run();
  } catch (error) {
    console.error(`[email] ${label} failed`, error);
  }
}

// ---------------------------------------------------------------- KW: new need from a club

export function buildNewNeedEmail(need: PlayerNeed & { clubs: Club }, site = getSiteUrl()) {
  const headline = needHeadline(need, "de");
  const { html, text } = renderEmail(
    {
      preheader: `${need.clubs.name} sucht ${headline} für ${need.season}.`,
      eyebrow: "Neuer Bedarf",
      title: `${need.clubs.name} sucht ${headline}`,
      intro: `${need.clubs.name} hat einen neuen Bedarf angelegt. Das System hat passende KW-Spieler schon vorsortiert.`,
      rows: [
        { label: "Verein", value: `${need.clubs.name} · ${need.clubs.league}` },
        { label: "Position", value: headline },
        { label: "Saison", value: need.season },
        { label: "Benötigt ab", value: formatDate(need.needed_from_date) },
        { label: "Priorität", value: PRIORITY_DE[need.priority] ?? need.priority }
      ],
      cta: { label: "Passende Spieler ansehen", href: `${site}/admin/needs/${need.id}#kw-spieler` },
      footer: "KW Sports Club Needs · interne Benachrichtigung"
    },
    site
  );
  return { subject: `Neuer Bedarf: ${need.clubs.name} · ${headline}`, html, text };
}

export function notifyKwNewNeed(needId: string) {
  return safely("new need", async () => {
    const admin = adminClientOrNull();
    if (!admin) return;
    const need = await loadNeed(admin, needId);
    if (!need) return;
    await sendEmail({ to: await kwRecipients(admin), ...buildNewNeedEmail(need) });
  });
}

// ---------------------------------------------------------------- Club: KW released a player

const suggestionCopy = {
  de: {
    subject: (headline: string) => `Neuer Spielervorschlag von KW Sports · ${headline}`,
    eyebrow: "Spielervorschlag",
    title: "Ein neuer Spieler für euren Bedarf",
    intro: (headline: string) =>
      `KW Sports hat einen Spieler für euren Bedarf „${headline}“ freigegeben. Profil und CV sind in der Plattform. Sagt uns mit einem Klick, ob ihr Interesse habt.`,
    position: "Spieler",
    fit: "Passung",
    need: "Euer Bedarf",
    cta: "Vorschlag ansehen",
    outro: "Vertraulich: Der Vorschlag ist nur für euren Verein sichtbar.",
    footer: "Ihr bekommt diese E-Mail, weil euer Verein KW Sports Club Needs nutzt."
  },
  en: {
    subject: (headline: string) => `New player suggestion from KW Sports · ${headline}`,
    eyebrow: "Player suggestion",
    title: "A new player for your need",
    intro: (headline: string) =>
      `KW Sports released a player for your need "${headline}". Profile and CV are on the platform. Tell us with one click whether you're interested.`,
    position: "Player",
    fit: "Fit",
    need: "Your need",
    cta: "View suggestion",
    outro: "Confidential: this suggestion is visible to your club only.",
    footer: "You receive this email because your club uses KW Sports Club Needs."
  },
  fr: {
    subject: (headline: string) => `Nouvelle proposition de KW Sports · ${headline}`,
    eyebrow: "Proposition de joueur",
    title: "Un nouveau joueur pour votre besoin",
    intro: (headline: string) =>
      `KW Sports vous propose un joueur pour votre besoin « ${headline} ». Profil et CV sont sur la plateforme. Dites-nous en un clic si vous êtes intéressés.`,
    position: "Joueur",
    fit: "Adéquation",
    need: "Votre besoin",
    cta: "Voir la proposition",
    outro: "Confidentiel : visible uniquement par votre club.",
    footer: "Vous recevez cet e-mail car votre club utilise KW Sports Club Needs."
  },
  es: {
    subject: (headline: string) => `Nueva propuesta de KW Sports · ${headline}`,
    eyebrow: "Propuesta de jugador",
    title: "Un nuevo jugador para vuestra necesidad",
    intro: (headline: string) =>
      `KW Sports os propone un jugador para vuestra necesidad «${headline}». Perfil y CV están en la plataforma. Decidnos con un clic si os interesa.`,
    position: "Jugador",
    fit: "Encaje",
    need: "Vuestra necesidad",
    cta: "Ver propuesta",
    outro: "Confidencial: solo visible para vuestro club.",
    footer: "Recibís este correo porque vuestro club usa KW Sports Club Needs."
  }
} as const;

export function notifyClubNewSuggestion(needId: string, playerId: string) {
  return safely("new suggestion", async () => {
    const admin = adminClientOrNull();
    if (!admin) return;
    const need = await loadNeed(admin, needId);
    const { data: match } = await admin
      .from("need_matches")
      .select("*")
      .eq("need_id", needId)
      .eq("player_id", playerId)
      .maybeSingle();
    const { data: playerRow } = await admin.from("kw_players").select("*").eq("id", playerId).maybeSingle();
    if (!need || !match || !playerRow) return;
    const email = buildSuggestionEmail(need, playerRow as KwPlayer, (match as NeedMatch).score);
    await sendEmail({ to: await clubRecipients(admin, need.club_id), ...email });
  });
}

export function buildSuggestionEmail(need: PlayerNeed & { clubs: Club }, player: KwPlayer, score: number, site = getSiteUrl()) {
  const locale = clubEmailLocale(need.clubs.country);
  const t = suggestionCopy[locale];
  const headline = needHeadline(need, locale);
  const { html, text } = renderEmail(
    {
      preheader: t.intro(headline),
      eyebrow: t.eyebrow,
      title: t.title,
      intro: t.intro(headline),
      rows: [
        { label: t.position, value: `${player.first_name} ${player.last_name}` },
        { label: t.need, value: `${headline} · ${need.season}` },
        { label: t.fit, value: `${score}%` }
      ],
      cta: { label: t.cta, href: `${site}/club/suggestions#need-${need.id}` },
      outro: t.outro,
      footer: t.footer
    },
    site
  );
  return { subject: t.subject(headline), html, text };
}

// ---------------------------------------------------------------- KW: club answered

export function notifyKwClubAnswer(matchId: string) {
  return safely("club answer", async () => {
    const admin = adminClientOrNull();
    if (!admin) return;
    const { data: matchRow } = await admin.from("need_matches").select("*").eq("id", matchId).maybeSingle();
    if (!matchRow) return;
    const match = matchRow as unknown as NeedMatch;
    if (match.status !== "interessiert") return; // Declines are in the inbox; no email noise.
    const need = await loadNeed(admin, match.need_id);
    const { data: playerRow } = await admin.from("kw_players").select("*").eq("id", match.player_id).maybeSingle();
    if (!need || !playerRow) return;
    const contacts = await clubRecipients(admin, need.club_id);
    const email = buildAnswerEmail(need, playerRow as KwPlayer, match, contacts);
    await sendEmail({ to: await kwRecipients(admin), ...email, replyTo: contacts[0] });
  });
}

export function buildAnswerEmail(
  need: PlayerNeed & { clubs: Club },
  player: KwPlayer,
  match: NeedMatch,
  contacts: string[],
  site = getSiteUrl()
) {
  const headline = needHeadline(need, "de");
  const name = `${player.first_name} ${player.last_name}`;
  const { html, text } = renderEmail(
    {
      preheader: `${need.clubs.name} hat Interesse an ${name}.`,
      eyebrow: "Interesse",
      title: `${need.clubs.name} will ${name}`,
      intro: `${need.clubs.name} hat Interesse an ${name} für den Bedarf ${headline} (${need.season}) gemeldet. Zeit, nachzufassen.`,
      rows: [
        { label: "Spieler", value: name },
        { label: "Bedarf", value: `${headline} · ${need.season}` },
        { label: "Passung", value: `${match.score}%` },
        ...(contacts.length > 0 ? [{ label: "Kontakt", value: contacts.join(", ") }] : [])
      ],
      quote: match.club_note,
      cta: { label: "Zur Inbox", href: `${site}/admin/inbox` },
      footer: "KW Sports Club Needs · interne Benachrichtigung"
    },
    site
  );
  return { subject: `Interesse: ${need.clubs.name} · ${name}`, html, text };
}

// ---------------------------------------------------------------- Club: monthly "still current?"

const reminderCopy = {
  de: {
    subject: "Sind eure Kaderbedarfe noch aktuell?",
    eyebrow: "Monatlicher Check",
    title: "Noch aktuell?",
    intro: (n: number) =>
      n === 1
        ? "Ein Bedarf wurde seit über 30 Tagen nicht bestätigt. Ein Klick genügt, damit Agenturen und KW Sports nur aktuelle Suchen sehen."
        : `${n} Bedarfe wurden seit über 30 Tagen nicht bestätigt. Ein Klick genügt, damit Agenturen und KW Sports nur aktuelle Suchen sehen.`,
    cta: "Jetzt bestätigen",
    outro: "Schon besetzt? Dann einfach den Status auf „Besetzt“ setzen.",
    confirmed: "zuletzt bestätigt",
    footer: "Ihr bekommt diese E-Mail einmal im Monat, solange Bedarfe offen sind."
  },
  en: {
    subject: "Are your squad needs still current?",
    eyebrow: "Monthly check",
    title: "Still current?",
    intro: (n: number) =>
      n === 1
        ? "One need hasn't been confirmed for over 30 days. One click keeps agencies and KW Sports looking at current searches only."
        : `${n} needs haven't been confirmed for over 30 days. One click keeps agencies and KW Sports looking at current searches only.`,
    cta: "Confirm now",
    outro: "Already filled? Just set the status to “Filled”.",
    confirmed: "last confirmed",
    footer: "You get this email once a month while needs are open."
  },
  fr: {
    subject: "Vos besoins sont-ils toujours d’actualité ?",
    eyebrow: "Contrôle mensuel",
    title: "Toujours d’actualité ?",
    intro: (n: number) =>
      n === 1
        ? "Un besoin n’a pas été confirmé depuis plus de 30 jours. Un clic suffit pour que les agences et KW Sports ne voient que des recherches actuelles."
        : `${n} besoins n’ont pas été confirmés depuis plus de 30 jours. Un clic suffit pour que les agences et KW Sports ne voient que des recherches actuelles.`,
    cta: "Confirmer",
    outro: "Déjà pourvu ? Passez simplement le statut à « Pourvu ».",
    confirmed: "confirmé le",
    footer: "Vous recevez cet e-mail une fois par mois tant que des besoins sont ouverts."
  },
  es: {
    subject: "¿Siguen vigentes vuestras necesidades?",
    eyebrow: "Control mensual",
    title: "¿Sigue vigente?",
    intro: (n: number) =>
      n === 1
        ? "Una necesidad no se ha confirmado en más de 30 días. Un clic basta para que agencias y KW Sports solo vean búsquedas actuales."
        : `${n} necesidades no se han confirmado en más de 30 días. Un clic basta para que agencias y KW Sports solo vean búsquedas actuales.`,
    cta: "Confirmar ahora",
    outro: "¿Ya cubierta? Cambiad el estado a «Cubierta».",
    confirmed: "confirmada el",
    footer: "Recibís este correo una vez al mes mientras haya necesidades abiertas."
  }
} as const;

const STALE_DAYS = 30;

/** Monthly job: one email per club listing its open needs not confirmed for 30+ days. Returns the number of clubs emailed. */
export async function sendStaleNeedReminders(now = new Date()) {
  const admin = adminClientOrNull();
  if (!admin) return 0;
  const cutoff = new Date(now.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await admin
    .from("player_needs")
    .select("*, clubs(*)")
    .in("status", ["offen", "in_gespraechen"])
    .lt("last_confirmed_at", cutoff);
  const needs = (data ?? []) as (PlayerNeed & { clubs: Club })[];

  const byClub = new Map<string, (PlayerNeed & { clubs: Club })[]>();
  needs.forEach((need) => byClub.set(need.club_id, [...(byClub.get(need.club_id) ?? []), need]));

  const site = getSiteUrl();
  let sent = 0;
  for (const [clubId, clubNeeds] of byClub) {
    await safely("stale reminder", async () => {
      const email = buildReminderEmail(clubNeeds, site);
      if (await sendEmail({ to: await clubRecipients(admin, clubId), ...email })) sent += 1;
    });
  }
  return sent;
}

export function buildReminderEmail(clubNeeds: (PlayerNeed & { clubs: Club })[], site = getSiteUrl()) {
    const locale = clubEmailLocale(clubNeeds[0].clubs.country);
    const t = reminderCopy[locale];
    const { html, text } = renderEmail(
      {
        preheader: t.intro(clubNeeds.length),
        eyebrow: t.eyebrow,
        title: t.title,
        intro: t.intro(clubNeeds.length),
        rows: clubNeeds.map((need) => ({
          label: `${needHeadline(need, locale)} · ${need.season}`,
          value: `${t.confirmed} ${formatDate(need.last_confirmed_at, locale)}`
        })),
        cta: { label: t.cta, href: `${site}/club?confirm=stale` },
        outro: t.outro,
        footer: t.footer
      },
      site
    );
    return { subject: t.subject, html, text };
}
