import { Lock, Save } from "lucide-react";
import {
  ATTACK_POSITIONS,
  COACH_ROLES,
  DEFENSE_POSITIONS,
  LANGUAGES,
  LEAGUE_EXPERIENCE_SUGGESTIONS,
  NEED_TYPES,
  PLAYER_TYPES,
  PRIORITIES,
  STATUSES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TARGET_ROLES,
  seasonForDate,
  seasonLabel,
  seasonOptions,
  seasonStartYear
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChipGroup } from "@/components/ui/chip-group";
import { DateTextInput } from "@/components/ui/date-text-input";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { MinSlider, RangeSlider } from "@/components/ui/range-slider";
import { ClubCascadeSelect } from "@/features/admin/club-cascade-select";
import type { NeedFormErrorCode } from "@/features/player-needs/form-schema";
import { NeedFormGuard } from "@/features/player-needs/need-form-guard";
import { hasNeedPosition } from "@/features/player-needs/need-summary";
import {
  CLUB_COACH_ROLE_LABELS,
  CLUB_CONTRACT_STATUS_SUGGESTIONS,
  CLUB_NEED_TYPE_LABELS,
  CLUB_PLAYER_TYPE_LABELS,
  CLUB_POSITION_LABELS,
  CLUB_PRIORITY_LABELS,
  CLUB_STATUS_LABELS,
  CLUB_TARGET_ROLE_LABELS,
  clubCopy,
  defensePositionLabel,
  languageLabel,
  type ClubLocale
} from "@/lib/club-i18n";
import type { AttackPosition, Club, DefensePosition, PlayerNeed, Season } from "@/types/domain";

/** Starting values for a new need, e.g. when created from a gap in the squad. */
export type NeedPrefill = {
  attack_positions?: AttackPosition[];
  defense_positions?: DefensePosition[];
  season?: Season;
  needed_from_date?: string;
};

export function NeedForm({
  action,
  need,
  confidentialNote,
  prefill,
  clubs,
  defaultClubId,
  submitLabel = "Speichern",
  error,
  locale = "de"
}: {
  action: (formData: FormData) => void | Promise<void>;
  need?: PlayerNeed;
  confidentialNote?: string | null;
  prefill?: NeedPrefill;
  clubs?: Club[];
  defaultClubId?: string | null;
  submitLabel?: string;
  error?: NeedFormErrorCode | null;
  locale?: ClubLocale;
}) {
  const t = clubCopy[locale].form;
  const priorityLabels = clubs ? PRIORITY_LABELS : CLUB_PRIORITY_LABELS[locale];
  const statusLabels = clubs ? STATUS_LABELS : CLUB_STATUS_LABELS[locale];
  const errorMessages: Record<NeedFormErrorCode, string> = {
    save: t.saveError,
    positions: t.positionsError,
    coach_role: t.coachRoleError
  };
  const nextSeason = seasonLabel(seasonStartYear(seasonForDate()) + 1);
  const selectedSeason = need?.season || prefill?.season || nextSeason;

  return (
    <form action={action} className="panel need-form">
      {need ? <input type="hidden" name="id" value={need.id} /> : null}

      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <h2 className="section-heading">{t.coreDetails}</h2>
        <p className="section-subtitle">{t.coreDetailsDescription}</p>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        {error ? <div className="alert-error md:col-span-2">{errorMessages[error]}</div> : null}
        <NeedFormGuard positionsError={t.positionsError} coachRoleError={t.coachRoleError} />

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

        <ChipGroup
          legend={t.needType}
          name="need_type"
          type="radio"
          options={NEED_TYPES.map((needType) => ({ value: needType, label: CLUB_NEED_TYPE_LABELS[locale][needType] }))}
          defaultValues={[need?.need_type || "spieler"]}
          className="md:col-span-2"
        />

        {need && need.need_type === "spieler" && !hasNeedPosition(need) ? (
          <div className="alert-warning player-only md:col-span-2">{t.legacyPositionHint}</div>
        ) : null}

        <ChipGroup
          legend={t.attackPositions}
          name="attack_positions"
          options={ATTACK_POSITIONS.map((position) => ({ value: position, label: CLUB_POSITION_LABELS[locale][position] }))}
          defaultValues={need?.attack_positions ?? prefill?.attack_positions}
          help={t.positionsHelp}
          className="player-only md:col-span-2"
        />

        <ChipGroup
          legend={t.defensePositions}
          name="defense_positions"
          options={DEFENSE_POSITIONS.map((position) => ({
            value: String(position),
            label: defensePositionLabel(position, locale)
          }))}
          defaultValues={need?.defense_positions ?? prefill?.defense_positions}
          help={t.defenseHelp}
          className="player-only md:col-span-2"
        />

        <ChipGroup
          legend={t.coachRole}
          name="coach_role"
          type="radio"
          options={COACH_ROLES.map((role) => ({ value: role, label: CLUB_COACH_ROLE_LABELS[locale][role] }))}
          defaultValues={need?.coach_role ? [need.coach_role] : []}
          className="coach-only md:col-span-2"
        />

        <Field label={t.season} htmlFor="season">
          <Select id="season" name="season" defaultValue={selectedSeason} required>
            {seasonOptions([selectedSeason]).map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.neededFrom} htmlFor="needed_from_date" help={t.neededFromHelp}>
          <DateTextInput
            id="needed_from_date"
            name="needed_from_date"
            defaultValue={need?.needed_from_date || prefill?.needed_from_date || ""}
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

      <details className="border-t border-slate-200" open>
        <summary className="cursor-pointer bg-white px-5 py-4 text-sm font-black uppercase text-navy-950 transition hover:bg-brand-50">
          {t.sportDetails}
        </summary>
        <div className="grid gap-5 px-5 pb-5 md:grid-cols-2">
          <div className="player-only">
            <RangeSlider
              label={t.age}
              nameMin="age_min"
              nameMax="age_max"
              min={15}
              max={45}
              defaultMin={need?.age_min}
              defaultMax={need?.age_max}
              anyLabel={t.any}
            />
          </div>

          <div className="player-only">
            <MinSlider
              label={t.heightMin}
              name="height_min"
              min={165}
              max={215}
              defaultValue={need?.height_min}
              anyLabel={t.any}
              unit=" cm"
            />
          </div>

          <ChipGroup
            legend={t.playerType}
            name="player_types"
            options={PLAYER_TYPES.map((type) => ({ value: type, label: CLUB_PLAYER_TYPE_LABELS[locale][type] }))}
            defaultValues={need?.player_types}
            className="player-only md:col-span-2"
          />

          <ChipGroup
            legend={t.targetRoles}
            name="target_roles"
            options={TARGET_ROLES.map((role) => ({ value: role, label: CLUB_TARGET_ROLE_LABELS[locale][role] }))}
            defaultValues={need?.target_roles}
            className="player-only md:col-span-2"
          />

          <Field label={t.playerTypeNote} htmlFor="player_type" className="player-only md:col-span-2">
            <Input id="player_type" name="player_type" defaultValue={need?.player_type || ""} />
          </Field>

          <ChipGroup
            legend={t.languages}
            name="languages"
            options={LANGUAGES.map((language) => ({ value: language, label: languageLabel(language, locale) }))}
            defaultValues={need?.languages}
            className="md:col-span-2"
          />

          <Field label={t.nationality} htmlFor="nationality_preference">
            <Input
              id="nationality_preference"
              name="nationality_preference"
              defaultValue={need?.nationality_preference || ""}
            />
          </Field>

          <Field label={t.leagueExperience} htmlFor="league_experience">
            <Input
              id="league_experience"
              name="league_experience"
              list="league_experience_suggestions"
              defaultValue={need?.league_experience || ""}
            />
            <datalist id="league_experience_suggestions">
              {LEAGUE_EXPERIENCE_SUGGESTIONS.map((league) => (
                <option key={league} value={league} />
              ))}
            </datalist>
          </Field>

          <Field label={t.contractStatus} htmlFor="contract_status_preference" className="md:col-span-2">
            <Input
              id="contract_status_preference"
              name="contract_status_preference"
              list="contract_status_suggestions"
              defaultValue={need?.contract_status_preference || ""}
            />
            <datalist id="contract_status_suggestions">
              {CLUB_CONTRACT_STATUS_SUGGESTIONS[locale].map((status) => (
                <option key={status} value={status} />
              ))}
            </datalist>
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

      <section className="border-t border-slate-200 px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-950 text-white">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <label htmlFor="confidential_note" className="section-heading">
              {t.confidential}
            </label>
            <p className="section-subtitle">{t.confidentialHelp}</p>
          </div>
        </div>
        <Textarea
          id="confidential_note"
          name="confidential_note"
          className="mt-4"
          defaultValue={confidentialNote || ""}
          placeholder={t.confidentialPlaceholder}
        />
      </section>

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
