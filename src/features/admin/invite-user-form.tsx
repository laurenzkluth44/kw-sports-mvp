"use client";

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, Copy, ImageUp, MailPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { ClubCascadeSelect } from "@/features/admin/club-cascade-select";
import { inviteUserAction, type InviteUserActionState } from "@/features/admin/user-actions";
import { ROLE_LABELS } from "@/lib/constants";
import { compressImageToWebpDataUrl } from "@/lib/image";
import type { AppRole } from "@/types/domain";

type InviteClubOption = {
  id: string;
  name: string;
  country: string;
  league: string;
};

const initialInviteUserState: InviteUserActionState = {
  status: "idle"
};

export function InviteUserForm({ clubs }: { clubs: InviteClubOption[] }) {
  const [state, formAction] = useActionState(inviteUserAction, initialInviteUserState);
  const [role, setRole] = useState<AppRole>("club");
  const [copied, setCopied] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear the picked logo once an invite was successfully sent or a link was generated.
  useEffect(() => {
    if (state.status === "sent" || state.status === "manual") clearLogo();
  }, [state.status]);

  useEffect(() => {
    if (role !== "club") clearLogo();
  }, [role]);

  async function copyInviteLink() {
    if (!state.actionLink) return;
    await navigator.clipboard.writeText(state.actionLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function clearLogo() {
    setLogoDataUrl("");
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      clearLogo();
      return;
    }

    setLogoBusy(true);
    setLogoError(null);
    try {
      const dataUrl = await compressImageToWebpDataUrl(file);
      setLogoDataUrl(dataUrl);
    } catch {
      setLogoDataUrl("");
      setLogoError("Logo konnte nicht verarbeitet werden. Bitte PNG, JPG oder WebP verwenden.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setLogoBusy(false);
    }
  }

  return (
    <form action={formAction} className="panel overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <h2 className="section-heading">Einladung senden</h2>
        <p className="section-subtitle">Sendet eine Supabase-Einladung oder erzeugt einen kopierbaren Link, falls SMTP blockiert.</p>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        {state.status === "sent" ? (
          <div className="alert-success md:col-span-2">
            <CheckCircle2 className="mr-1 inline h-4 w-4" aria-hidden="true" />
            Einladung wurde per E-Mail an {state.email} gesendet.
          </div>
        ) : null}

        {state.status === "manual" && state.actionLink ? (
          <div className="alert-warning space-y-3 md:col-span-2">
            <p>
              Supabase konnte die E-Mail nicht verschicken. Der Einladungslink wurde trotzdem erstellt und kann manuell
              versendet werden.
            </p>
            {state.detail ? <p className="text-xs text-amber-700">Supabase: {state.detail}</p> : null}
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Input value={state.actionLink} readOnly aria-label="Einladungslink" />
              <Button type="button" variant="secondary" onClick={copyInviteLink}>
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? "Kopiert" : "Link kopieren"}
              </Button>
            </div>
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="alert-error md:col-span-2">
            <p>{state.message}</p>
            {state.detail ? <p className="mt-1 text-xs text-red-600">Supabase: {state.detail}</p> : null}
          </div>
        ) : null}

        <Field label="Name" htmlFor="invite_name">
          <Input id="invite_name" name="invite_name" required />
        </Field>
        <Field label="E-Mail" htmlFor="invite_email">
          <Input id="invite_email" name="invite_email" type="email" required />
        </Field>
        <Field label="Rolle" htmlFor="invite_role">
          <Select
            id="invite_role"
            name="invite_role"
            value={role}
            onChange={(event) => setRole(event.target.value as AppRole)}
            required
          >
            <option value="club">{ROLE_LABELS.club}</option>
            <option value="agency">{ROLE_LABELS.agency}</option>
            <option value="admin">{ROLE_LABELS.admin}</option>
          </Select>
        </Field>

        {role === "club" ? (
          <>
            <ClubCascadeSelect
              clubs={clubs}
              fieldName="invite_club_id"
              idPrefix="invite_club"
              emptyClubLabel="Verein auswählen"
              clubClassName="md:col-span-2"
            />

            <input type="hidden" name="invite_logo" value={logoDataUrl} />
            <Field label="Vereinslogo (optional)" htmlFor="invite_logo_file" className="md:col-span-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
                  {logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoDataUrl} alt="Logo Vorschau" className="h-full w-full object-contain" />
                  ) : (
                    <ImageUp className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  )}
                </span>
                <div className="flex flex-col gap-1">
                  <input
                    ref={fileInputRef}
                    id="invite_logo_file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onLogoChange}
                    className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy-950 hover:file:bg-brand-50"
                  />
                  <p className="text-xs text-slate-500">
                    {logoBusy
                      ? "Logo wird komprimiert..."
                      : "Wird komprimiert und beim ausgewählten Verein gespeichert."}
                  </p>
                </div>
                {logoDataUrl ? (
                  <Button type="button" variant="secondary" onClick={clearLogo}>
                    <X className="h-4 w-4" aria-hidden="true" />
                    Entfernen
                  </Button>
                ) : null}
              </div>
              {logoError ? <p className="mt-1 text-xs text-red-600">{logoError}</p> : null}
            </Field>
          </>
        ) : null}

        {role === "agency" ? (
          <Field label="Agency Name" htmlFor="invite_agency_name" className="md:col-span-2">
            <Input id="invite_agency_name" name="invite_agency_name" placeholder="z.B. Partner Agency GmbH" required />
            <p className="field-help mt-1">
              Agency User sehen alle Bedarfe und Details nur lesend, ohne Admin-Funktionen.
            </p>
          </Field>
        ) : null}

        {role === "admin" ? (
          <div className="panel-muted md:col-span-2">
            <p className="text-sm text-slate-600">
              Admins erhalten volle KW Sports Kontrolle über Nutzer, Clubs, Bedarfe, Exporte und Notizen.
            </p>
          </div>
        ) : null}

        <div className="md:col-span-2">
          <SubmitButton pendingLabel="Einladung wird erstellt...">
            <MailPlus className="h-4 w-4" aria-hidden="true" />
            Einladung senden
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
