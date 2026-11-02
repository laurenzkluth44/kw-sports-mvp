import Link from "next/link";
import { CheckCircle2, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flash } from "@/components/ui/flash";
import { PageHeader } from "@/components/ui/page-header";
import { setMatchHandledAction } from "@/features/kw-players/actions";
import { kwPlayerHeadline } from "@/features/kw-players/kw-player-card";
import { needHeadline } from "@/features/player-needs/need-summary";
import { cn, formatDate } from "@/lib/utils";
import type { KwPlayer, NeedFillSource, NeedMatch, PlayerNeedWithClub, Profile } from "@/types/domain";

export const INBOX_TABS = ["offen", "wartet", "erledigt", "abgesagt"] as const;
export type InboxTab = (typeof INBOX_TABS)[number];

const TAB_LABELS: Record<InboxTab, string> = {
  offen: "Interessiert",
  wartet: "Wartet auf Antwort",
  erledigt: "Erledigt",
  abgesagt: "Kein Interesse"
};

const TAB_HINTS: Record<InboxTab, string> = {
  offen: "Vereine, die Interesse an einem Spieler gemeldet haben. Nachfassen und danach als erledigt markieren.",
  wartet: "Freigegebene Vorschläge ohne Antwort. Ab 7 Tagen lohnt sich eine Nachfrage beim Verein.",
  erledigt: "Interessen, bei denen KW Sports schon nachgefasst hat.",
  abgesagt: "Absagen mit Begründung helfen, die nächsten Vorschläge besser zu treffen."
};

export function inboxTabOf(match: NeedMatch, needClosed = false): InboxTab {
  // A suggestion for a need that is already filled or archived is no longer waiting for anything.
  if (match.status === "freigegeben") return needClosed ? "erledigt" : "wartet";
  if (match.status === "kein_interesse") return "abgesagt";
  return match.handled_at ? "erledigt" : "offen";
}

const DAY = 24 * 60 * 60 * 1000;

/** KW inbox of club answers to released players. Pure view, also used by the screenshot preview. */
export function AdminInboxView({
  tab,
  matches,
  needs,
  players,
  contacts,
  done,
  error,
  outcomes = [],
  now = Date.now()
}: {
  tab: InboxTab;
  matches: NeedMatch[];
  needs: PlayerNeedWithClub[];
  players: KwPlayer[];
  /** Club users by club id, for one-click contact. */
  contacts: Map<string, Profile[]>;
  done?: string;
  error?: string;
  /** How filled needs were filled (KW-internal). */
  outcomes?: { need_id: string; filled_via: NeedFillSource }[];
  now?: number;
}) {
  const needById = new Map(needs.map((need) => [need.id, need]));
  const playerById = new Map(players.map((player) => [player.id, player]));
  const known = matches.filter((match) => needById.has(match.need_id) && playerById.has(match.player_id));
  const closed = (match: NeedMatch) => {
    const status = needById.get(match.need_id)?.status;
    return status === "besetzt" || status === "archiviert";
  };
  const tabOf = (match: NeedMatch) => inboxTabOf(match, closed(match));
  const counts = Object.fromEntries(INBOX_TABS.map((key) => [key, known.filter((match) => tabOf(match) === key).length])) as Record<
    InboxTab,
    number
  >;
  const placements = outcomes.filter((outcome) => outcome.filled_via === "kw_sports").length;
  const interestedTotal = known.filter((match) => match.status === "interessiert").length;
  const rows = known
    .filter((match) => tabOf(match) === tab)
    .sort((a, b) =>
      tab === "wartet"
        ? a.released_at.localeCompare(b.released_at)
        : (b.responded_at ?? "").localeCompare(a.responded_at ?? "")
    );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="KW Sports Admin"
        title="Antworten der Vereine"
        description="Was die Vereine zu deinen Spielervorschlägen sagen, auf einen Blick."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InboxStat label="Vorschläge gesendet" value={known.length} />
        <InboxStat label="Interesse gemeldet" value={interestedTotal} sub={known.length ? `${Math.round((interestedTotal / known.length) * 100)} % der Vorschläge` : undefined} />
        <InboxStat label="Besetzt über KW Sports" value={placements} highlight={placements > 0} />
        <InboxStat
          label="Anteil KW an Besetzungen"
          value={outcomes.length ? `${Math.round((placements / outcomes.length) * 100)} %` : "–"}
          sub={outcomes.length ? `${placements} von ${outcomes.length} gemeldeten` : "Noch keine Besetzung gemeldet"}
        />
      </section>

      <Flash message={done === "handled" ? "Als erledigt markiert." : done === "reopened" ? "Wieder geöffnet." : null} />
      {error ? <div className="alert-error">Das hat nicht geklappt. Bitte erneut versuchen.</div> : null}

      <nav aria-label="Ansicht" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {INBOX_TABS.map((key) => (
          <Link
            key={key}
            href={key === "offen" ? "/admin/inbox" : `/admin/inbox?tab=${key}`}
            aria-current={key === tab ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-extrabold uppercase tracking-[0.1em]",
              key === tab ? "border-brand-500 text-navy-950" : "border-transparent text-slate-500 hover:text-navy-950"
            )}
          >
            {TAB_LABELS[key]}
            <span
              className={cn(
                "px-1.5 py-0.5 text-[0.7rem] leading-none",
                key === tab ? (key === "offen" && counts[key] > 0 ? "bg-brand-500 text-white" : "bg-navy-950 text-white") : "bg-slate-100 text-slate-600"
              )}
            >
              {counts[key]}
            </span>
          </Link>
        ))}
      </nav>

      <p className="text-sm text-slate-600">{TAB_HINTS[tab]}</p>

      {rows.length === 0 ? (
        <div className="panel-muted px-5 py-10 text-center text-sm text-slate-600">
          {tab === "offen" ? "Alles erledigt. Keine offenen Interessen." : "Hier ist gerade nichts."}
        </div>
      ) : (
        <ul className="panel divide-y divide-slate-200">
          {rows.map((match) => {
            const need = needById.get(match.need_id)!;
            const player = playerById.get(match.player_id)!;
            const people = contacts.get(need.club_id) ?? [];
            const waitingDays = Math.floor((now - new Date(match.released_at).getTime()) / DAY);
            return (
              <li key={match.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {need.clubs.name} · {needHeadline(need, "de")} · {need.season}
                  </p>
                  <p className="mt-1 font-bold text-navy-950">
                    <Link href={`/admin/players/${player.id}/edit`} className="hover:text-brand-600">
                      {player.first_name} {player.last_name}
                    </Link>{" "}
                    <span className="font-normal text-slate-500">· {kwPlayerHeadline(player, "de")}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Freigegeben am {formatDate(match.released_at)}
                    {match.responded_at ? ` · Antwort am ${formatDate(match.responded_at)}` : ""}
                    {match.handled_at ? ` · erledigt am ${formatDate(match.handled_at)}` : ""}
                  </p>
                </div>

                <div className="min-w-0 space-y-2">
                  {match.club_note ? (
                    <p className="border-l-2 border-brand-500 pl-3 text-sm italic text-slate-700">„{match.club_note}“</p>
                  ) : match.status === "freigegeben" && closed(match) ? (
                    <p className="text-sm text-slate-500">Bedarf geschlossen, ohne Antwort des Vereins.</p>
                  ) : tab === "wartet" ? (
                    <p className={cn("text-sm font-semibold", waitingDays >= 7 ? "text-amber-700" : "text-slate-500")}>
                      {waitingDays <= 0 ? "Heute freigegeben" : waitingDays === 1 ? "Seit 1 Tag offen" : `Seit ${waitingDays} Tagen offen`}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">Keine Notiz</p>
                  )}
                  {people.length > 0 ? (
                    <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {people.slice(0, 3).map((person) => (
                        <a
                          key={person.id}
                          href={`mailto:${person.email}?subject=${encodeURIComponent(`${player.first_name} ${player.last_name} · ${needHeadline(need, "de")}`)}`}
                          className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                          {person.name || person.email}
                        </a>
                      ))}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Link
                    href={`/admin/needs/${need.id}#kw-spieler`}
                    className="inline-flex min-h-10 items-center px-2 text-xs font-extrabold uppercase tracking-[0.1em] text-navy-950 hover:text-brand-600"
                  >
                    Zum Bedarf →
                  </Link>
                  {tab === "offen" || (tab === "erledigt" && match.status !== "freigegeben") ? (
                    <form action={setMatchHandledAction}>
                      <input type="hidden" name="match_id" value={match.id} />
                      <input type="hidden" name="handled" value={tab === "offen" ? "1" : "0"} />
                      <input type="hidden" name="tab" value={tab === "offen" ? "" : tab} />
                      <Button type="submit" variant={tab === "offen" ? "accent" : "secondary"} className="min-h-10 px-3 text-[0.7rem]">
                        {tab === "offen" ? (
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        )}
                        {tab === "offen" ? "Erledigt" : "Wieder öffnen"}
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function InboxStat({ label, value, sub, highlight }: { label: string; value: number | string; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn("border-l-[3px] border-brand-500 px-4 py-3 shadow-card", highlight ? "bg-brand-500 text-white" : "bg-white")}>
      <p className={cn("text-[0.7rem] font-bold uppercase tracking-[0.16em]", highlight ? "text-white/80" : "text-slate-500")}>{label}</p>
      <p className="mt-1 font-display text-3xl leading-none">{value}</p>
      {sub ? <p className={cn("mt-1 text-xs", highlight ? "text-white/80" : "text-slate-500")}>{sub}</p> : null}
    </div>
  );
}
