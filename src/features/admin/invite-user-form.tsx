"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Copy, MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { inviteUserAction, type InviteUserActionState } from "@/features/admin/user-actions";
import { ROLE_LABELS } from "@/lib/constants";

type InviteClubOption = {
  id: string;
  name: string;
  league: string;
};

const initialInviteUserState: InviteUserActionState = {
  status: "idle"
};

export function InviteUserForm({ clubs }: { clubs: InviteClubOption[] }) {
  const [state, formAction] = useActionState(inviteUserAction, initialInviteUserState);
  const [copied, setCopied] = useState(false);

  async function copyInviteLink() {
    if (!state.actionLink) return;
    await navigator.clipboard.writeText(state.actionLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <form action={formAction} className="panel grid gap-5 p-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-lg font-bold text-navy-950">Einladung senden</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sendet eine Supabase-Einladung oder erzeugt einen kopierbaren Link, falls SMTP blockiert.
        </p>
      </div>

      {state.status === "sent" ? (
        <div className="rounded-md border border-brand-100 bg-brand-100 px-3 py-2 text-sm text-brand-700 md:col-span-2">
          <CheckCircle2 className="mr-1 inline h-4 w-4" aria-hidden="true" />
          Einladung wurde per E-Mail an {state.email} gesendet.
        </div>
      ) : null}

      {state.status === "manual" && state.actionLink ? (
        <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800 md:col-span-2">
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
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
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
        <Select id="invite_role" name="invite_role" defaultValue="club" required>
          <option value="club">{ROLE_LABELS.club}</option>
          <option value="admin">{ROLE_LABELS.admin}</option>
        </Select>
      </Field>
      <Field label="Verein" htmlFor="invite_club_id">
        <Select id="invite_club_id" name="invite_club_id" defaultValue="">
          <option value="">Kein Verein</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name} · {club.league}
            </option>
          ))}
        </Select>
      </Field>
      <div className="md:col-span-2">
        <SubmitButton pendingLabel="Einladung wird erstellt...">
          <MailPlus className="h-4 w-4" aria-hidden="true" />
          Einladung senden
        </SubmitButton>
      </div>
    </form>
  );
}
