import { Save } from "lucide-react";
import { POSITIONS, PRIORITIES, SEASONS, STATUSES, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { DateTextInput } from "@/components/ui/date-text-input";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { ClubCascadeSelect } from "@/features/admin/club-cascade-select";
import {
  CLUB_POSITION_LABELS,
  CLUB_PRIORITY_LABELS,
  CLUB_STATUS_LABELS,
  clubCopy,
  type ClubLocale
} from "@/lib/club-i18n";
import type { Club, PlayerNeed } from "@/types/domain";

export function NeedForm({
  action,
  need,
  clubs,
  defaultClubId,
  submitLabel = "Speichern",
  error,
  locale = "de"
}: {
  action: (formData: FormData) => void | Promise<void>;
  need?: PlayerNeed;
  clubs?: Club[];
  defaultClubId?: string | null;
  submitLabel?: string;
  error?: string | null;
  locale?: ClubLocale;
}) {
  const t = clubCopy[locale].form;
  const positionLabels = CLUB_POSITION_LABELS[locale];
  const priorityLabels = clubs ? PRIORITY_LABELS : CLUB_PRIORITY_LABELS[locale];
  const statusLabels = clubs ? STATUS_LABELS : CLUB_STATUS_LABELS[locale];

  return (
    <form action={action} className="panel">
      {need ? <input type="hidden" name="id" value={need.id} /> : null}

      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <h2 className="section-heading">{t.coreDetails}</h2>
        <p className="section-subtitle">{t.coreDetailsDescription}</p>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        {error ? (
          <div className="alert-error md:col-span-2">{t.saveError}</div>
        ) : null}

        {clubs ? (
          <ClubCascadeSelect
            clubs={clubs}
            fieldName="club_id"
            defaultClubId={need?.club_id || defaultClubId}
            required
            idPrefix="need_club"
            clubLabel={t.club}
            clubClassName="md:col-span-2"
          />
        ) : null}

        <Field label={t.season} htmlFor="season">
          <Select id="season" name="season" defaultValue={need?.season || "2026/27"} required>
            {SEASONS.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.position} htmlFor="position">
          <Select id="position" name="position" defaultValue={need?.position || "RL"} required>
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {clubs ? position : positionLabels[position]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.neededFrom} htmlFor="needed_from_date" help={t.neededFromHelp}>
          <DateTextInput
            id="needed_from_date"
            name="needed_from_date"
            defaultValue={need?.needed_from_date || ""}
            required
          />
        </Field>

        <Field label={t.priority} htmlFor="priority">
          <Select id="priority" name="priority" defaultValue={need?.priority || "mittel"} required>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.status} htmlFor="status">
          <Select id="status" name="status" defaultValue={need?.status || "offen"} required>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.closedAt} htmlFor="closed_at_date" help={t.closedAtHelp}>
          <DateTextInput
            id="closed_at_date"
            name="closed_at_date"
            defaultValue={dateInputValue(need?.closed_at)}
          />
        </Field>

        <Field label={t.statusNote} htmlFor="status_note" className="md:col-span-2">
          <Textarea
            id="status_note"
            name="status_note"
            defaultValue={need?.status_note || ""}
            placeholder={t.statusNotePlaceholder}
          />
        </Field>

        <Field label={t.description} htmlFor="description" className="md:col-span-2">
          <Textarea
            id="description"
            name="description"
            defaultValue={need?.description || ""}
            placeholder={t.descriptionPlaceholder}
          />
        </Field>
      </div>

      <details className="border-t border-slate-200">
        <summary className="cursor-pointer bg-white px-5 py-4 text-sm font-black uppercase text-navy-950 transition hover:bg-brand-50">
          {t.sportDetails}
        </summary>
        <div className="grid gap-5 px-5 pb-5 md:grid-cols-3">
          <Field label={t.ageMin} htmlFor="age_min">
            <Input id="age_min" name="age_min" type="number" min="15" max="60" defaultValue={need?.age_min ?? ""} />
          </Field>

          <Field label={t.ageMax} htmlFor="age_max">
            <Input id="age_max" name="age_max" type="number" min="15" max="60" defaultValue={need?.age_max ?? ""} />
          </Field>

          <Field label={t.heightMin} htmlFor="height_min">
            <Input
              id="height_min"
              name="height_min"
              type="number"
              min="140"
              max="230"
              defaultValue={need?.height_min ?? ""}
            />
          </Field>

          <Field label={t.nationality} htmlFor="nationality_preference">
            <Input
              id="nationality_preference"
              name="nationality_preference"
              defaultValue={need?.nationality_preference || ""}
            />
          </Field>

          <Field label={t.leagueExperience} htmlFor="league_experience">
            <Input id="league_experience" name="league_experience" defaultValue={need?.league_experience || ""} />
          </Field>

          <Field label={t.playerType} htmlFor="player_type">
            <Input id="player_type" name="player_type" defaultValue={need?.player_type || ""} />
          </Field>

          <Field label={t.contractStatus} htmlFor="contract_status_preference" className="md:col-span-3">
            <Input
              id="contract_status_preference"
              name="contract_status_preference"
              defaultValue={need?.contract_status_preference || ""}
            />
          </Field>
        </div>
      </details>

      <details className="border-t border-slate-200">
        <summary className="cursor-pointer bg-white px-5 py-4 text-sm font-black uppercase text-navy-950 transition hover:bg-brand-50">
          {t.budget}
        </summary>
        <div className="grid gap-5 px-5 pb-5 md:grid-cols-[1fr_0.5fr]">
          <Field label={t.budgetAmount} htmlFor="budget_amount">
            <Input
              id="budget_amount"
              name="budget_amount"
              type="number"
              min="0"
              step="100"
              defaultValue={need?.budget_amount ?? ""}
            />
          </Field>

          <Field label={t.currency} htmlFor="budget_currency">
            <Input id="budget_currency" name="budget_currency" maxLength={3} defaultValue={need?.budget_currency || ""} />
          </Field>

          <Field label={t.budgetNote} htmlFor="budget_note" className="md:col-span-2">
            <Textarea id="budget_note" name="budget_note" defaultValue={need?.budget_note || ""} />
          </Field>
        </div>
      </details>

      <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end">
        <Button type="submit">
          <Save className="h-4 w-4" aria-hidden="true" />
          {submitLabel || t.save}
        </Button>
      </div>
    </form>
  );
}

function dateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}
