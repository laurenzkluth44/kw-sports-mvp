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
  invite: "Einladung konnte nicht aktiviert werden. Bitte Link erneut öffnen oder neue Einladung anfordern.",
  update: "Passwort konnte nicht gesetzt werden. Bitte Link erneut öffnen oder neue Einladung anfordern."
};

export function SetPasswordForm() {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function prepareInviteSession() {
      const sessionError = await hydrateSessionFromUrl();
      if (sessionError) {
        setReady(false);
        setError(sessionError);
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setReady(Boolean(data.session));
      setError(data.session ? null : errorCopy.session);
      setLoading(false);
    }

    async function hydrateSessionFromUrl() {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) return errorCopy.invite;

        window.history.replaceState(null, "", window.location.pathname);
        return null;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return errorCopy.invite;

        window.history.replaceState(null, "", window.location.pathname);
      }

      return null;
    }

    prepareInviteSession();
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

      {error ? <div className="alert-error">{error}</div> : null}

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
