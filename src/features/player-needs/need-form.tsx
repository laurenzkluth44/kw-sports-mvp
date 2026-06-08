import { Save } from "lucide-react";
import { POSITIONS, PRIORITIES, SEASONS, STATUSES, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import type { Club, PlayerNeed } from "@/types/domain";

export function NeedForm({
  action,
  need,
  clubs,
  submitLabel = "Speichern",
  error
}: {
  action: (formData: FormData) => void | Promise<void>;
  need?: PlayerNeed;
  clubs?: Club[];
  submitLabel?: string;
  error?: string | null;
}) {
  return (
    <form action={action} className="panel overflow-hidden">
      {need ? <input type="hidden" name="id" value={need.id} /> : null}

      <div className="grid gap-5 p-5 md:grid-cols-2">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
            Speichern fehlgeschlagen. Bitte Pflichtfelder und Werte prüfen.
          </div>
        ) : null}

        {clubs ? (
          <Field label="Verein" htmlFor="club_id" className="md:col-span-2">
            <Select id="club_id" name="club_id" defaultValue={need?.club_id} required>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} · {club.league}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field label="Saison" htmlFor="season">
          <Select id="season" name="season" defaultValue={need?.season || "2026/27"} required>
            {SEASONS.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Position" htmlFor="position">
          <Select id="position" name="position" defaultValue={need?.position || "RL"} required>
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Benötigt ab" htmlFor="needed_from_date">
          <Input
            id="needed_from_date"
            name="needed_from_date"
            type="date"
            defaultValue={need?.needed_from_date || ""}
            required
          />
        </Field>

        <Field label="Priorität" htmlFor="priority">
          <Select id="priority" name="priority" defaultValue={need?.priority || "mittel"} required>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={need?.status || "offen"} required>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Besetzt/archiviert seit" htmlFor="closed_at_date" help="Optional, nur bei Status Besetzt oder Archiviert.">
          <Input
            id="closed_at_date"
            name="closed_at_date"
            type="date"
            defaultValue={dateInputValue(need?.closed_at)}
          />
        </Field>

        <Field label="Statusnotiz" htmlFor="status_note" className="md:col-span-2">
          <Textarea
            id="status_note"
            name="status_note"
            defaultValue={need?.status_note || ""}
            placeholder="Optional: z.B. besetzt seit Datum, Grund für Archivierung oder aktueller Stand"
          />
        </Field>

        <Field label="Kurzbeschreibung" htmlFor="description" className="md:col-span-2">
          <Textarea
            id="description"
            name="description"
            defaultValue={need?.description || ""}
            placeholder="Sportliches Profil, Kontext oder interne Hinweise"
          />
        </Field>
      </div>

      <details className="border-t border-slate-200">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-navy-950">
          Optionale sportliche Details
        </summary>
        <div className="grid gap-5 px-5 pb-5 md:grid-cols-3">
          <Field label="Alter min." htmlFor="age_min">
            <Input id="age_min" name="age_min" type="number" min="15" max="60" defaultValue={need?.age_min ?? ""} />
          </Field>

          <Field label="Alter max." htmlFor="age_max">
            <Input id="age_max" name="age_max" type="number" min="15" max="60" defaultValue={need?.age_max ?? ""} />
          </Field>

          <Field label="Größe min. cm" htmlFor="height_min">
            <Input
              id="height_min"
              name="height_min"
              type="number"
              min="140"
              max="230"
              defaultValue={need?.height_min ?? ""}
            />
          </Field>

          <Field label="Nationalität" htmlFor="nationality_preference">
            <Input
              id="nationality_preference"
              name="nationality_preference"
              defaultValue={need?.nationality_preference || ""}
            />
          </Field>

          <Field label="Liga-Erfahrung" htmlFor="league_experience">
            <Input id="league_experience" name="league_experience" defaultValue={need?.league_experience || ""} />
          </Field>

          <Field label="Spielertyp" htmlFor="player_type">
            <Input id="player_type" name="player_type" defaultValue={need?.player_type || ""} />
          </Field>

          <Field label="Vertragsstatus" htmlFor="contract_status_preference" className="md:col-span-3">
            <Input
              id="contract_status_preference"
              name="contract_status_preference"
              defaultValue={need?.contract_status_preference || ""}
            />
          </Field>
        </div>
      </details>

      <details className="border-t border-slate-200">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-navy-950">
          Optionales Budget
        </summary>
        <div className="grid gap-5 px-5 pb-5 md:grid-cols-[1fr_0.5fr]">
          <Field label="Budgetbetrag" htmlFor="budget_amount">
            <Input
              id="budget_amount"
              name="budget_amount"
              type="number"
              min="0"
              step="100"
              defaultValue={need?.budget_amount ?? ""}
            />
          </Field>

          <Field label="Währung" htmlFor="budget_currency">
            <Input id="budget_currency" name="budget_currency" maxLength={3} defaultValue={need?.budget_currency || ""} />
          </Field>

          <Field label="Budgetnotiz" htmlFor="budget_note" className="md:col-span-2">
            <Textarea id="budget_note" name="budget_note" defaultValue={need?.budget_note || ""} />
          </Field>
        </div>
      </details>

      <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end">
        <Button type="submit">
          <Save className="h-4 w-4" aria-hidden="true" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function dateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}
