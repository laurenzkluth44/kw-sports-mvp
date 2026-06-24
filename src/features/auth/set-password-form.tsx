"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { SetPasswordCopy } from "@/lib/auth-i18n";

export function SetPasswordForm({ copy }: { copy: SetPasswordCopy }) {
  const errorCopy = copy.errors;
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personName, setPersonName] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let active = true;

    // Surface who was invited and to which club, from the invite session metadata.
    async function loadInviteDetails() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) return;

      const meta = (session.user.user_metadata ?? {}) as { name?: string; club_id?: string };
      if (active && meta.name) setPersonName(meta.name);

      if (meta.club_id) {
        if (active && base) {
          setLogoUrl(`${base}/storage/v1/object/public/club-logos/${meta.club_id}/logo.webp`);
        }
        const { data: club } = await supabase
          .from("clubs")
          .select("name")
          .eq("id", meta.club_id)
          .maybeSingle();
        if (active && club?.name) setClubName(club.name as string);
      }
    }

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
      if (data.session) await loadInviteDetails();
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
    return () => {
      active = false;
    };
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

  const clubTitle = clubName ?? "Club Needs";
  const hasClubLogo = Boolean(logoUrl) && !logoFailed;
  // Spinner while the invite session resolves, or while the club logo is still downloading.
  const showSpinner = loading || (hasClubLogo && !logoLoaded);

  return (
    <form onSubmit={onSubmit} className="panel space-y-6 border-l-2 border-l-brand-500 p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <p className="eyebrow">{copy.access}</p>
        <span className="relative mt-5 flex h-24 min-w-[6rem] items-center justify-center">
          {showSpinner ? (
            <Loader2 className="absolute h-8 w-8 animate-spin text-brand-500" aria-label="Logo wird geladen" />
          ) : null}

          {hasClubLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl as string}
              alt={clubTitle}
              className={cn(
                "h-24 w-24 object-contain transition-opacity duration-300 ease-out-expo",
                logoLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoFailed(true)}
            />
          ) : !loading ? (
            <Image
              src="/kw-sports-logo.svg"
              alt="KW Sports"
              width={2557}
              height={288}
              className="w-40"
              unoptimized
            />
          ) : null}
        </span>
        <h2 className="kw-title mt-4 text-4xl">{clubTitle}</h2>
        {personName ? (
          <p className="mt-1.5 text-sm text-neutral-600">
            {copy.welcome}, <span className="font-semibold text-navy-950">{personName}</span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-center border-t border-slate-200/80 pt-6 text-center">
        <h1 className="kw-title text-2xl">{copy.title}</h1>
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-neutral-600">{copy.description}</p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-neutral-500">{copy.checking}</p>
      ) : null}

      {error ? <div className="alert-error">{error}</div> : null}

      <Field label={copy.newPassword} htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>

      <Field label={copy.repeatPassword} htmlFor="password_confirm">
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
        {copy.submit}
      </Button>
    </form>
  );
}
