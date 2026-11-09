import Link from "next/link";
import { Clock3, Send, Undo2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { releaseNeedMatchAction, withdrawNeedMatchAction } from "@/features/kw-players/actions";
import { signedFileUrls } from "@/features/kw-players/files";
import { playerFreshness } from "@/features/kw-players/freshness";
import { kwPlayerHeadline } from "@/features/kw-players/kw-player-card";
import { rankPlayersForNeed } from "@/features/matching/engine";
import { MatchReasons, scoreTone } from "@/features/matching/match-reasons";
import type { AuthedContext } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import type { KwPlayer, NeedMatch, PlayerNeed } from "@/types/domain";

const STATUS = {
  freigegeben: { label: "Beim Verein", className: "bg-navy-950 text-white" },
  interessiert: { label: "Interessiert", className: "bg-brand-500 text-white" },
  kein_interesse: { label: "Kein Interesse", className: "bg-slate-200 text-slate-700" }
} as const;

/** Admin view on a need: ranked KW players (engine) and what was already sent to the club. */
export async function AdminNeedMatches({
  supabase,
  need,
  done,
  error
}: {
  supabase: AuthedContext["supabase"];
  need: PlayerNeed;
  done?: string;
  error?: string;
}) {
  const [{ data: playerRows }, { data: matchRows }] = await Promise.all([
    supabase.from("kw_players").select("*, kw_player_games(*)"),
    supabase.from("need_matches").select("*").eq("need_id", need.id).order("released_at", { ascending: false })
  ]);
  const players = (playerRows ?? []) as KwPlayer[];
  const matches = (matchRows ?? []) as unknown as NeedMatch[];
  const photos = await signedFileUrls(supabase, players.map((player) => player.photo_path));

  return <AdminNeedMatchesView need={need} players={players} matches={matches} photos={photos} done={done} error={error} />;
}

/** Pure rendering, also used by the screenshot preview. */
export function AdminNeedMatchesView({
  need,
  players,
  matches,
  photos,
  done,
  error
}: {
  need: PlayerNeed;
  players: KwPlayer[];
  matches: NeedMatch[];
  photos: Map<string, string>;
  done?: string;
  error?: string;
}) {
  const byId = new Map(players.map((player) => [player.id, player]));
  const releasedIds = new Set(matches.map((match) => match.player_id));
  const closed = need.status === "besetzt" || need.status === "archiviert";
  const suggestions = closed ? [] : rankPlayersForNeed(need, players).filter((result) => !releasedIds.has(result.player.id)).slice(0, 8);

  return (
    <section id="kw-spieler" className="panel scroll-mt-28 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 bg-navy-950 px-5 py-5 text-white">
        <div>
          <p className="eyebrow eyebrow-light">Matching</p>
          <h2 className="mt-2 font-display text-[2.5rem] uppercase leading-[0.9]">Passende KW-Spieler</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/70">
            Vorschläge nach Position, Verfügbarkeit, Alter, Größe, Sprache, Spielertyp und Liga-Erfahrung. Der Verein sieht einen
            Spieler erst, wenn du ihn freigibst.
          </p>
        </div>
        <Link href="/admin/players" className="text-xs font-extrabold uppercase tracking-[0.1em] text-brand-300 hover:text-white">
          Spielerdatenbank →
        </Link>
      </div>

      {done === "released" ? <div className="alert-success m-5 mb-0">Spieler für den Verein freigegeben.</div> : null}
      {error === "match" ? (
        <div className="alert-error m-5 mb-0">Das hat nicht geklappt. Ist der Spieler im Profil für Vereine freigegeben?</div>
      ) : null}

      {matches.length > 0 ? (
        <div className="border-b border-slate-200 p-5">
          <h3 className="section-heading mb-3">An den Verein gesendet · {matches.length}</h3>
          <ul className="divide-y divide-slate-100">
            {matches.map((match) => {
              const player = byId.get(match.player_id);
              if (!player) return null;
              return (
                <li key={match.id} className="grid gap-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                  <PlayerThumb player={player} url={player.photo_path ? photos.get(player.photo_path) : null} />
                  <div className="min-w-0">
                    <p className="font-bold">
                      {player.first_name} {player.last_name}{" "}
                      <span className="font-normal text-slate-500">· {kwPlayerHeadline(player, "de")}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Freigegeben am {formatDate(match.released_at)}
                      {match.responded_at ? ` · Antwort am ${formatDate(match.responded_at)}` : ""}
                    </p>
                    {match.club_note ? <p className="mt-1 text-sm italic text-slate-700">„{match.club_note}“</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.1em]", STATUS[match.status].className)}>
                      {STATUS[match.status].label}
                    </span>
                    <form action={withdrawNeedMatchAction}>
                      <input type="hidden" name="need_id" value={need.id} />
                      <input type="hidden" name="match_id" value={match.id} />
                      <Button type="submit" variant="secondary" className="min-h-9 px-3 text-[0.7rem]" title="Vorschlag zurückziehen">
                        <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Zurückziehen
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="p-5">
        <h3 className="section-heading mb-3">Vorschläge des Systems</h3>
        {suggestions.length === 0 ? (
          <p className="text-sm text-slate-600">
            {closed ? (
              "Der Bedarf ist geschlossen. Es werden keine neuen Spieler vorgeschlagen."
            ) : (
              <>
                {players.length === 0
                  ? "Noch keine Spieler in der Datenbank."
                  : "Kein weiterer KW-Spieler passt zur gesuchten Position bzw. Trainerrolle."}{" "}
                <Link href="/admin/players/new" className="font-bold">
                  Spieler anlegen
                </Link>
              </>
            )}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {suggestions.map(({ player, score, reasons }) => (
              <li key={player.id} className="grid gap-3 border border-slate-200 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-12 w-12 items-center justify-center font-display text-xl", scoreTone(score))} title="Passung in %">
                    {score}
                  </span>
                  <PlayerThumb player={player} url={player.photo_path ? photos.get(player.photo_path) : null} />
                </div>
                <div className="min-w-0 space-y-2">
                  <p className="font-bold">
                    <Link href={`/admin/players/${player.id}/edit`} className="hover:text-brand-600">
                      {player.first_name} {player.last_name}
                    </Link>{" "}
                    <span className="font-normal text-slate-500">
                      · {kwPlayerHeadline(player, "de")}
                      {player.current_club ? ` · ${player.current_club}` : ""}
                    </span>
                  </p>
                  <MatchReasons reasons={reasons} locale="de" />
                  {(() => {
                    const fresh = playerFreshness(player);
                    return fresh.stale ? (
                      <Link
                        href={`/admin/players/${player.id}/edit`}
                        className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
                      >
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {fresh.label}: vor dem Freigeben prüfen
                      </Link>
                    ) : null;
                  })()}
                </div>
                {player.visible_to_clubs ? (
                  <form action={releaseNeedMatchAction}>
                    <input type="hidden" name="need_id" value={need.id} />
                    <input type="hidden" name="player_id" value={player.id} />
                    <Button type="submit" variant="accent" className="w-full md:w-auto">
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Für Verein freigeben
                    </Button>
                  </form>
                ) : (
                  <Link
                    href={`/admin/players/${player.id}/edit`}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900 md:max-w-[12rem] md:text-right"
                  >
                    Im Profil noch nicht für Vereine freigegeben →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function PlayerThumb({ player, url }: { player: KwPlayer; url?: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-12 w-10 shrink-0 bg-slate-100 object-cover object-top" />
  ) : (
    <span className="flex h-12 w-10 shrink-0 items-center justify-center bg-navy-950 text-white/70">
      <UserRound className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}
