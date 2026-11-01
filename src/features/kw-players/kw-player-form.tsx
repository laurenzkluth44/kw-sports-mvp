import type { ReactNode } from "react";
import { FileText, ImageIcon, Lock, Save } from "lucide-react";
import { ChipGroup } from "@/components/ui/chip-group";
import { DateTextInput } from "@/components/ui/date-text-input";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { CourtPositionPicker } from "@/features/player-needs/court-position-picker";
import {
  CLUB_COACH_ROLE_LABELS,
  CLUB_PLAYER_TYPE_LABELS,
  CLUB_POSITION_LABELS,
  CLUB_POSITION_SHORT_LABELS,
  defensePositionLabel,
  languageLabel
} from "@/lib/club-i18n";
import { COACH_ROLES, DEFENSE_POSITIONS, LANGUAGES, LEAGUE_EXPERIENCE_SUGGESTIONS, PLAYER_TYPES } from "@/lib/constants";
import { needFormFlowCopy } from "@/lib/need-form-i18n";
import type { DefensePosition, KwPlayer } from "@/types/domain";

const ERRORS: Record<string, string> = {
  save: "Speichern fehlgeschlagen. Bitte Name und die markierten Angaben prüfen.",
  consent: "Für Vereine freigeben geht erst, wenn das Datum der Einwilligung eingetragen ist.",
  file: "Datei abgelehnt: Foto als JPG, PNG oder WebP bis 3 MB, CV als PDF bis 10 MB.",
  delete: "Spieler konnte nicht gelöscht werden."
};

export function KwPlayerForm({
  action,
  player,
  error,
  photoUrl,
  cvUrl
}: {
  action: (formData: FormData) => void | Promise<void>;
  player?: KwPlayer;
  error?: string;
  photoUrl?: string | null;
  cvUrl?: string | null;
}) {
  const defenseLabels = Object.fromEntries(
    DEFENSE_POSITIONS.map((position) => [position, defensePositionLabel(position, "de")])
  ) as Record<DefensePosition, string>;

  return (
    <form action={action} className="panel need-form overflow-hidden">
      {player ? <input type="hidden" name="id" value={player.id} /> : null}
      {error && ERRORS[error] ? <div className="alert-error m-5 mb-0">{ERRORS[error]}</div> : null}

      <Section title="Person">
        <div className="grid gap-4 md:grid-cols-2">
          <ChipGroup
            legend="Art"
            name="need_type"
            type="radio"
            options={[
              { value: "spieler", label: "Spieler" },
              { value: "trainer", label: "Trainer" }
            ]}
            defaultValues={[player?.kind ?? "spieler"]}
            className="md:col-span-2"
          />
          <Field label="Vorname" htmlFor="first_name">
            <Input id="first_name" name="first_name" required maxLength={80} defaultValue={player?.first_name ?? ""} />
          </Field>
          <Field label="Nachname" htmlFor="last_name">
            <Input id="last_name" name="last_name" required maxLength={80} defaultValue={player?.last_name ?? ""} />
          </Field>
          <Field label="Geburtsdatum" htmlFor="birth_date" help="Format: JJJJ-MM-TT">
            <DateTextInput id="birth_date" name="birth_date" defaultValue={player?.birth_date ?? ""} />
          </Field>
          <Field label="Nationalität" htmlFor="nationality">
            <Input id="nationality" name="nationality" defaultValue={player?.nationality ?? ""} />
          </Field>
        </div>
      </Section>

      <Section title="Positionen">
        <div className="player-only">
          <CourtPositionPicker
            attackDefault={player?.attack_positions ?? []}
            defenseDefault={player?.defense_positions ?? []}
            attackLabels={CLUB_POSITION_LABELS.de}
            attackShort={CLUB_POSITION_SHORT_LABELS.de}
            defenseLabels={defenseLabels}
            legendAttack="Angriffspositionen"
            legendDefense="Abwehrpositionen"
            helpAttack="Alle Positionen, die der Spieler auf hohem Niveau spielen kann."
            helpDefense="1/6 Außen · 2/5 Halb · 3/4 Innenblock"
            copy={needFormFlowCopy.de.picker}
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Wurfhand" htmlFor="handedness">
              <Select id="handedness" name="handedness" defaultValue={player?.handedness ?? ""}>
                <option value="">–</option>
                <option value="rechts">Rechts</option>
                <option value="links">Links</option>
                <option value="beidhaendig">Beidhändig</option>
              </Select>
            </Field>
            <Field label="Größe in cm" htmlFor="height_cm">
              <Input id="height_cm" name="height_cm" type="number" min={140} max={230} defaultValue={player?.height_cm ?? ""} />
            </Field>
          </div>
        </div>
        <ChipGroup
          legend="Trainerrollen"
          name="coach_roles"
          options={COACH_ROLES.map((role) => ({ value: role, label: CLUB_COACH_ROLE_LABELS.de[role] }))}
          defaultValues={player?.coach_roles ?? []}
          className="coach-only"
        />
      </Section>

      <Section title="Verein & Verfügbarkeit">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Aktueller Verein" htmlFor="current_club">
            <Input id="current_club" name="current_club" defaultValue={player?.current_club ?? ""} />
          </Field>
          <Field label="Aktuelle Liga" htmlFor="current_league">
            <Input id="current_league" name="current_league" list="league_suggestions" defaultValue={player?.current_league ?? ""} />
          </Field>
          <Field label="Vertrag bis" htmlFor="contract_until" help="Leer lassen, wenn vertragslos.">
            <DateTextInput id="contract_until" name="contract_until" defaultValue={player?.contract_until ?? ""} />
          </Field>
          <Field label="Verfügbar ab" htmlFor="available_from" help="Wenn abweichend vom Vertragsende, z. B. bei Ausstiegsklausel.">
            <DateTextInput id="available_from" name="available_from" defaultValue={player?.available_from ?? ""} />
          </Field>
          <Field label="Liga-Erfahrung" htmlFor="league_experience" className="md:col-span-2">
            <Input id="league_experience" name="league_experience" list="league_suggestions" defaultValue={player?.league_experience ?? ""} />
          </Field>
          <datalist id="league_suggestions">
            {LEAGUE_EXPERIENCE_SUGGESTIONS.map((league) => (
              <option key={league} value={league} />
            ))}
          </datalist>
        </div>
      </Section>

      <Section title="Profil">
        <div className="grid gap-5">
          <ChipGroup
            legend="Spielertyp"
            name="player_types"
            options={PLAYER_TYPES.map((type) => ({ value: type, label: CLUB_PLAYER_TYPE_LABELS.de[type] }))}
            defaultValues={player?.player_types ?? []}
            className="player-only"
          />
          <ChipGroup
            legend="Sprachen"
            name="languages"
            options={LANGUAGES.map((language) => ({ value: language, label: languageLabel(language, "de") }))}
            defaultValues={player?.languages ?? []}
          />
          <Field label="Kurzprofil (für Vereine sichtbar)" htmlFor="profile">
            <Textarea id="profile" name="profile" maxLength={2000} defaultValue={player?.profile ?? ""} />
          </Field>
          <Field label="Video-Link" htmlFor="video_url" help="https://… (YouTube, Drive-Ordner o. ä.)">
            <Input id="video_url" name="video_url" type="url" pattern="https://.*" defaultValue={player?.video_url ?? ""} />
          </Field>
        </div>
      </Section>

      <Section title="Foto & CV">
        <div className="grid gap-4 md:grid-cols-2">
          <FileField
            id="photo"
            label="Foto"
            accept="image/jpeg,image/png,image/webp"
            help="JPG, PNG oder WebP, bis 3 MB."
            icon={<ImageIcon className="h-4 w-4" aria-hidden="true" />}
            currentHref={photoUrl}
            currentLabel="Aktuelles Foto ansehen"
          />
          <FileField
            id="cv"
            label="CV (PDF)"
            accept="application/pdf"
            help="Der KW-CV als PDF, bis 10 MB. Eine neue Datei ersetzt die alte."
            icon={<FileText className="h-4 w-4" aria-hidden="true" />}
            currentHref={cvUrl}
            currentLabel="Aktuellen CV öffnen"
          />
        </div>
      </Section>

      <Section title="Freigabe für Vereine">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-navy-950 text-white">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm leading-6 text-slate-600">
            Vereine sehen einen Spieler nur, wenn er hier freigegeben ist <strong>und</strong> KW Sports ihn für einen konkreten
            Bedarf des Vereins vorgeschlagen hat. Agenturen sehen KW-Spieler nie.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Einwilligung des Spielers am" htmlFor="consent_at" help="Pflicht für die Freigabe.">
            <DateTextInput id="consent_at" name="consent_at" defaultValue={player?.consent_at ?? ""} />
          </Field>
          <label htmlFor="visible_to_clubs" className="flex min-h-11 cursor-pointer items-center gap-3 self-end border border-slate-200 px-4 py-3">
            <input
              id="visible_to_clubs"
              name="visible_to_clubs"
              type="checkbox"
              defaultChecked={player?.visible_to_clubs ?? false}
              className="h-5 w-5 accent-[#0055ff]"
            />
            <span className="text-sm font-bold">Für Vereine freigegeben</span>
          </label>
        </div>
      </Section>

      <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-5">
        <SubmitButton variant="accent" pendingLabel="Wird gespeichert...">
          <Save className="h-4 w-4" aria-hidden="true" />
          {player ? "Änderungen speichern" : "Spieler anlegen"}
        </SubmitButton>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-slate-200 px-5 py-5">
      <h2 className="section-heading mb-4">{title}</h2>
      {children}
    </section>
  );
}

function FileField({
  id,
  label,
  accept,
  help,
  icon,
  currentHref,
  currentLabel
}: {
  id: string;
  label: string;
  accept: string;
  help: string;
  icon: ReactNode;
  currentHref?: string | null;
  currentLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 border border-dashed border-slate-300 p-4">
      <label htmlFor={id} className="field-label inline-flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input id={id} name={id} type="file" accept={accept} className="text-sm file:mr-3 file:min-h-10 file:border-0 file:bg-navy-950 file:px-4 file:text-xs file:font-bold file:uppercase file:tracking-[0.08em] file:text-white" />
      <p className="field-help">{help}</p>
      {currentHref ? (
        <a href={currentHref} target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-600 hover:text-brand-700">
          {currentLabel} →
        </a>
      ) : null}
    </div>
  );
}
