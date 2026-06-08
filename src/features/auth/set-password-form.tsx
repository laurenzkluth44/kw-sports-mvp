"use client";

import { useEffect, useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const errorCopy: Record<string, string> = {
  session: "Der Einladungslink ist abgelaufen oder wurde bereits verwendet. Bitte KW Sports um eine neue Einladung.",
  mismatch: "Die Passwörter stimmen nicht überein.",
  short: "Bitte wähle ein Passwort mit mindestens 8 Zeichen.",
  update: "Passwort konnte nicht gesetzt werden. Bitte Link erneut öffnen oder neue Einladung anfordern."
};

export function SetPasswordForm() {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
      setError(data.session ? null : errorCopy.session);
      setLoading(false);
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const passwordConfirm = String(formData.get("password_confirm") || "");

    if (password.length < 8) {
      setError(errorCopy.short);
      return;
    }

    if (password !== passwordConfirm) {
      setError(errorCopy.mismatch);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(errorCopy.update);
      return;
    }

    window.location.href = "/";
  }

  return (
    <form onSubmit={onSubmit} className="panel space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-black uppercase text-navy-950">Passwort setzen</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Lege dein Passwort fest, um deinen KW Sports Zugang zu aktivieren.
        </p>
      </div>

      {loading ? <p className="text-sm text-neutral-500">Einladung wird geprüft...</p> : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Field label="Neues Passwort" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>

      <Field label="Passwort wiederholen" htmlFor="password_confirm">
        <Input
          id="password_confirm"
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>

      <Button type="submit" className="w-full" disabled={!ready || loading}>
        <KeyRound className="h-4 w-4" aria-hidden="true" />
        Passwort speichern
      </Button>
    </form>
  );
}
