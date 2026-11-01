import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/form";
import { setNeedOutcomeAction } from "@/features/kw-players/actions";
import { cn, formatDate } from "@/lib/utils";
import type { KwPlayer, NeedFillSource, NeedOutcome, PlayerNeed } from "@/types/domain";

export const FILL_SOURCE_LABELS: Record<NeedFillSource, string> = {
  kw_sports: "Über KW Sports",
  andere_agentur: "Über eine andere Agentur",
  eigene_suche: "Eigene Suche des Vereins",
  intern: "Eigener Kader / Nachwuchs"
};

/**
 * "Ergebnis" on the KW need page: how the position was filled and, for KW placements,
 * which KW player. Internal only; agencies never see it.
 */
export function AdminNeedOutcome({
  need,
  outcome,
  players,
  matchedPlayerIds,
  done,
  error
}: {
  need: PlayerNeed;
  outcome: NeedOutcome | null;
  players: KwPlayer[];
  /** Players already suggested for this need, offered first. */
  matchedPlayerIds: string[];
  done?: string;
  error?: string;
}) {
  if (need.status !== "besetzt" && !outcome) return null;

  const viaKw = outcome?.filled_via === "kw_sports";
  const linked = outcome?.kw_player_id ? players.find((player) => player.id === outcome.kw_player_id) : null;
  const matched = players.filter((player) => matchedPlayerIds.includes(player.id));
  const others = players.filter((player) => !matchedPlayerIds.includes(player.id));
  const name = (player: KwPlayer) => `${player.last_name}, ${player.first_name}`;

  return (
    <section id="ergebnis" className={cn("scroll-mt-32 border-l-4 p-5 shadow-card", viaKw ? "border-brand-500 bg-navy-950 text-white" : "border-slate-300 bg-white")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Trophy className={cn("mt-0.5 h-5 w-5 shrink-0", viaKw ? "text-brand-300" : "text-slate-400")} aria-hidden="true" />
          <div>
            <h2 className={cn("text-sm font-extrabold uppercase tracking-[0.1em]", viaKw ? "text-white" : "text-navy-950")}>
              {outcome ? FILL_SOURCE_LABELS[outcome.filled_via] : "Besetzt, ohne Angabe"}
              {linked ? ` · ${linked.first_name} ${linked.last_name}` : ""}
            </h2>
            <p className={cn("mt-1 text-sm", viaKw ? "text-white/70" : "text-slate-600")}>
              {outcome
                ? `Erfasst am ${formatDate(outcome.updated_at)}. Nur intern sichtbar, Agenturen sehen das nicht.`
                : "Der Verein hat nicht angegeben, wie die Position besetzt wurde. Trag es hier ein, damit die Auswertung stimmt."}
              {viaKw && !linked ? " Bitte den KW-Spieler zuordnen." : ""}
            </p>
          </div>
        </div>
      </div>

      {done === "outcome" ? <p className={cn("mt-3 text-sm font-semibold", viaKw ? "text-brand-300" : "text-brand-700")}>Gespeichert.</p> : null}
      {error === "outcome" ? <p className="mt-3 text-sm font-semibold text-red-500">Konnte nicht gespeichert werden.</p> : null}

      <form action={setNeedOutcomeAction} className={cn("mt-4 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end", viaKw ? "bg-white text-navy-950" : "bg-slate-50")}>
        <input type="hidden" name="need_id" value={need.id} />
        <Field label="Besetzt" htmlFor="filled_via">
          <Select id="filled_via" name="filled_via" defaultValue={outcome?.filled_via ?? ""}>
            <option value="">Keine Angabe</option>
            {(Object.keys(FILL_SOURCE_LABELS) as NeedFillSource[]).map((source) => (
              <option key={source} value={source}>
                {FILL_SOURCE_LABELS[source]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="KW-Spieler (bei KW Sports)" htmlFor="kw_player_id">
          <Select id="kw_player_id" name="kw_player_id" defaultValue={outcome?.kw_player_id ?? ""}>
            <option value="">Nicht zugeordnet</option>
            {matched.length > 0 ? (
              <optgroup label="Für diesen Bedarf vorgeschlagen">
                {matched.map((player) => (
                  <option key={player.id} value={player.id}>
                    {name(player)}
                  </option>
                ))}
              </optgroup>
            ) : null}
            <optgroup label="Alle KW-Spieler">
              {others.map((player) => (
                <option key={player.id} value={player.id}>
                  {name(player)}
                </option>
              ))}
            </optgroup>
          </Select>
        </Field>
        <Button type="submit" variant="accent">
          Speichern
        </Button>
      </form>
    </section>
  );
}
