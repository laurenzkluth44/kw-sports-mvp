import Link from "next/link";
import type { ReactNode } from "react";
import { Save } from "lucide-react";
import { ChipGroup } from "@/components/ui/chip-group";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { contractSeasons, seasonOfContractEnd } from "@/features/squad/squad-model";
import { CLUB_POSITION_LABELS, defensePositionLabel, type ClubLocale } from "@/lib/club-i18n";
import { ATTACK_POSITIONS, DEFENSE_POSITIONS, seasonEndDate } from "@/lib/constants";
import type { SquadCopy } from "@/lib/squad-i18n";
import { formatDate } from "@/lib/utils";
import type { AttackPosition, RosterPlayer } from "@/types/domain";

export function PlayerForm({
  action,
  player,
  defaultPosition,
  error,
  t,
  locale
}: {
  action: (formData: FormData) => void | Promise<void>;
  player?: RosterPlayer;
  defaultPosition?: AttackPosition;
  error?: boolean;
  t: SquadCopy;
  locale: ClubLocale;
}) {
  const f = t.form;
  const currentContractSeason = player ? seasonOfContractEnd(player.contract_until) : null;
  const seasons = contractSeasons(currentContractSeason);
  // New players default to a contract until the end of next season.
  const defaultContractSeason = currentContractSeason ?? seasons[1];
  const mainPosition = player?.position ?? defaultPosition;
  const positionOptions = ATTACK_POSITIONS.map((position) => ({
    value: position,
    label: CLUB_POSITION_LABELS[locale][position]
  }));

  return (
    <form action={action} className="panel player-form overflow-hidden">
      {player ? <input type="hidden" name="id" value={player.id} /> : null}
      {error ? <div className="alert-error m-5 mb-0">{f.saveError}</div> : null}

      <FormSection title={f.person}>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_8rem]">
          <Field label={f.firstName} htmlFor="first_name">
            <Input id="first_name" name="first_name" required maxLength={80} autoComplete="off" defaultValue={player?.first_name ?? ""} />
          </Field>
          <Field label={f.lastName} htmlFor="last_name">
            <Input id="last_name" name="last_name" required maxLength={80} autoComplete="off" defaultValue={player?.last_name ?? ""} />
          </Field>
          <Field label={f.jersey} htmlFor="jersey_number">
            <Input
              id="jersey_number"
              name="jersey_number"
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              defaultValue={player?.jersey_number ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title={f.positions}>
        <div className="space-y-5">
          <ChipGroup
            legend={f.mainPosition}
            name="position"
            type="radio"
            required
            options={positionOptions}
            defaultValues={mainPosition ? [mainPosition] : []}
          />
          <ChipGroup
            legend={f.secondaryPositions}
            name="secondary_positions"
            options={positionOptions}
            defaultValues={player?.secondary_positions ?? []}
            help={f.secondaryHelp}
          />
          <ChipGroup
            legend={f.defensePositions}
            name="defense_positions"
            options={DEFENSE_POSITIONS.map((position) => ({
              value: String(position),
              label: defensePositionLabel(position, locale)
            }))}
            defaultValues={player?.defense_positions ?? []}
            help={f.defenseHelp}
          />
        </div>
      </FormSection>

      <FormSection title={f.contract}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={f.contractUntil} htmlFor="contract_season" help={f.contractHelp}>
            <Select id="contract_season" name="contract_season" required defaultValue={defaultContractSeason}>
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {f.contractOption(season, formatDate(seasonEndDate(season), locale))}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={f.notes} htmlFor="notes" className="md:col-span-2">
            <Textarea id="notes" name="notes" maxLength={2000} placeholder={f.notesPlaceholder} defaultValue={player?.notes ?? ""} />
          </Field>
        </div>
      </FormSection>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/club/squad"
          className="inline-flex min-h-10 items-center justify-center px-4 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-slate-600 hover:text-navy-950"
        >
          {f.cancel}
        </Link>
        <SubmitButton variant="accent" pendingLabel={f.saving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {player ? f.save : f.create}
        </SubmitButton>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-slate-200 px-5 py-5 last-of-type:border-b-0">
      <h2 className="section-heading mb-4">{title}</h2>
      {children}
    </section>
  );
}
