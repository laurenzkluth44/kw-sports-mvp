import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { deleteKwPlayerGameAction, saveKwPlayerGameAction } from "@/features/kw-players/stats-actions";
import { seasonLines } from "@/features/kw-players/stats-model";
import { formatDate } from "@/lib/utils";
import type { KwPlayerGame } from "@/types/domain";

const COMPETITIONS = ["1. HBL", "2. HBL", "3. Liga", "Håndboldligaen", "1. Division (DK)", "EHF Champions League", "EHF European League", "DHB-Pokal"];

const dash = (value: number | null | undefined, suffix = "") => (value === null || value === undefined ? "–" : `${String(value).replace(".", ",")}${suffix}`);

function NumberField({ name, label, step }: { name: string; label: string; step?: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</span>
      <Input name={name} type="number" inputMode={step ? "decimal" : "numeric"} min={step ? undefined : 0} step={step ?? "1"} className="px-2" />
    </label>
  );
}

/**
 * Admin panel on the player page: season totals as clubs see them, the recorded games,
 * and a form to add a game or a "season so far" summary row by hand.
 * Normally the weekly match-day update fills this in.
 */
export function KwPlayerStatsAdmin({ playerId, games, result }: { playerId: string; games: KwPlayerGame[]; result?: string }) {
  const lines = seasonLines(games);
  const recent = [...games].sort((a, b) => b.game_date.localeCompare(a.game_date)).slice(0, 15);

  return (
    <section id="statistik" className="panel scroll-mt-28 overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="eyebrow">Statistik</p>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none text-navy-950">Saisonwerte</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Kommt jede Woche automatisch aus dem Spieltags-Update. Vereine sehen auf der Spielerkarte die aktuelle Saison der Liga mit den meisten Spielen.
          Für frühere Spiele eine Sammelzeile anlegen, z. B. „Saison bis 08.11.“ mit Anzahl Spiele.
        </p>
        {result === "saved" ? <p className="alert-success mt-3">Gespeichert.</p> : null}
        {result === "deleted" ? <p className="alert-success mt-3">Zeile gelöscht.</p> : null}
        {result === "error" ? <p className="alert-error mt-3">Konnte nicht gespeichert werden. Bitte Wettbewerb, Datum und Zahlen prüfen.</p> : null}
      </div>

      <div className="space-y-6 px-5 py-5">
        {lines.length === 0 ? (
          <p className="text-sm text-slate-500">Noch keine Spiele erfasst.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="table-header text-left">
                  {["Saison", "Wettbewerb", "Spiele", "Tore", "Würfe", "Wurf %", "Assists", "TF", "2 Min", "HPI ⌀", "Paraden", "Quote"].map((label) => (
                    <th key={label} className="px-2 py-2 first:pl-0">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={`${line.season}-${line.competition}`} className="border-b border-slate-100 font-semibold text-navy-950">
                    <td className="py-2 pr-2">{line.season}</td>
                    <td className="px-2">{line.competition}</td>
                    <td className="px-2">{line.games}</td>
                    <td className="px-2">{dash(line.goals)}</td>
                    <td className="px-2">{dash(line.shots)}</td>
                    <td className="px-2">{dash(line.shotPct, " %")}</td>
                    <td className="px-2">{dash(line.assists)}</td>
                    <td className="px-2">{dash(line.turnovers)}</td>
                    <td className="px-2">{dash(line.twoMin)}</td>
                    <td className="px-2">{dash(line.hpi)}</td>
                    <td className="px-2">{dash(line.saves)}</td>
                    <td className="px-2">{dash(line.savePct, " %")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {recent.length > 0 ? (
          <details className="border border-slate-200">
            <summary className="cursor-pointer px-4 py-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em] text-navy-950 hover:bg-slate-50">
              Erfasste Spiele ({games.length})
            </summary>
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {recent.map((game) => (
                <li key={game.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-bold text-navy-950">{formatDate(game.game_date)}</span> · {game.competition}
                    {game.games > 1 ? ` · ${game.games} Spiele` : ""} {game.game ? <span className="text-slate-500">· {game.game}</span> : null}
                    <span className="block text-xs text-slate-500">
                      {game.saves !== null
                        ? `${dash(game.saves)} Paraden, ${dash(game.goals_against)} Gegentore`
                        : `${dash(game.goals)}/${dash(game.shots)} Tore, ${dash(game.assists)} Assists, ${dash(game.turnovers)} TF`}
                      {game.hpi !== null ? `, HPI ${dash(game.hpi)}` : ""} · {game.source ?? "–"}
                    </span>
                  </span>
                  <form action={deleteKwPlayerGameAction}>
                    <input type="hidden" name="player_id" value={playerId} />
                    <input type="hidden" name="id" value={game.id} />
                    <button type="submit" aria-label="Zeile löschen" className="p-2 text-slate-400 hover:text-red-700">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <form action={saveKwPlayerGameAction} className="space-y-3 border-t border-slate-100 pt-5">
          <input type="hidden" name="player_id" value={playerId} />
          <p className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em] text-navy-950">Spiel oder Sammelzeile erfassen</p>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,10rem)_minmax(0,1fr)_minmax(0,6rem)]">
            <label className="flex flex-col gap-1">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-500">Wettbewerb</span>
              <Input name="competition" list="kw-competitions" required maxLength={60} />
              <datalist id="kw-competitions">
                {COMPETITIONS.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-500">Datum (letztes Spiel)</span>
              <Input name="game_date" type="date" required />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-500">Spiel / Bezeichnung</span>
              <Input name="game" maxLength={120} placeholder="z. B. Coburg – Dormagen 29:30 oder Saison bis 08.11." />
            </label>
            <NumberField name="games" label="Spiele" />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-12">
            <NumberField name="goals" label="Tore" />
            <NumberField name="shots" label="Würfe" />
            <NumberField name="seven_goals" label="7m-Tore" />
            <NumberField name="assists" label="Assists" />
            <NumberField name="steals" label="Steals" />
            <NumberField name="blocks" label="Blocks" />
            <NumberField name="turnovers" label="TF" />
            <NumberField name="two_min" label="2 Min" />
            <NumberField name="hpi" label="HPI ⌀" step="0.1" />
            <NumberField name="saves" label="Paraden" />
            <NumberField name="goals_against" label="Gegentore" />
          </div>
          <p className="field-help">Leere Felder = nicht erfasst. Gleicher Wettbewerb und gleiches Datum überschreibt die vorhandene Zeile.</p>
          <Button type="submit" variant="accent">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Speichern
          </Button>
        </form>
      </div>
    </section>
  );
}
