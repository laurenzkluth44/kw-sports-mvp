"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { SetPasswordCopy } from "@/lib/auth-i18n";
import { isAcceptablePassword, MIN_PASSWORD_LENGTH, passwordChecks, type PasswordCheck } from "@/lib/password-rules";
import type { AppRole } from "@/types/domain";

export function SetPasswordForm({ copy, mode = "invite" }: { copy: SetPasswordCopy; mode?: "invite" | "reset" }) {
  const errorCopy = copy.errors;
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personName, setPersonName] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const checks = passwordChecks(password, confirmation);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let active = true;

    // Surface who was invited and to which club, from the invite session metadata.
    async function loadInviteDetails() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) return;

      const meta = (session.user.user_metadata ?? {}) as { name?: string; club_id?: string; agency_name?: string };
      if (active && meta.name) setPersonName(meta.name);
      if (active && meta.agency_name) setAgencyName(meta.agency_name);

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
  }, [errorCopy.invite, errorCopy.session]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmation && checks.length && checks.letter && checks.number) {
      setError(errorCopy.mismatch);
      return;
    }
    if (!isAcceptablePassword(password, confirmation)) {
      setError(errorCopy.short);
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setSaving(false);
      setError(errorCopy.update);
      return;
    }

    window.location.replace(await resolvePostPasswordPath(supabase));
  }

  const clubTitle = clubName ?? agencyName ?? "KW Club Hub";
  const hasClubLogo = Boolean(logoUrl) && !logoFailed;
  // Spinner while the invite session resolves, or while the club logo is still downloading.
  const showSpinner = loading || (hasClubLogo && !logoLoaded);

  const rules: { key: PasswordCheck; label: string }[] = [
    { key: "length", label: copy.ruleLength },
    { key: "letter", label: copy.ruleLetter },
    { key: "number", label: copy.ruleNumber },
    { key: "match", label: copy.ruleMatch }
  ];
  const inputClass =
    "min-h-12 w-full border border-slate-200 px-3.5 pr-12 text-[0.95rem] outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {mode === "invite" ? (
        <div className="flex items-center gap-4">
          <span className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            {showSpinner ? (
              <Loader2 className="absolute h-6 w-6 animate-spin text-brand-500" aria-label="Logo wird geladen" />
            ) : null}
            {hasClubLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl as string}
                alt={clubTitle}
                className={cn(
                  "h-16 w-16 object-contain transition-opacity duration-300 ease-out-expo",
                  logoLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoFailed(true)}
              />
            ) : !loading ? (
              <Image src="/kw-sports-logo.svg" alt="KW Sports" width={2557} height={288} className="w-16" unoptimized />
            ) : null}
          </span>
          <div className="min-w-0">
            <p className="eyebrow">{copy.access}</p>
            <p className="mt-1 truncate font-display text-[1.9rem] uppercase leading-none">{clubTitle}</p>
            {personName ? (
              <p className="mt-1 text-sm text-slate-600">
                {copy.welcome}, <span className="font-semibold text-navy-950">{personName}</span>
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="eyebrow">{copy.access}</p>
      )}

      <div className={mode === "invite" ? "border-t border-slate-200 pt-5" : ""}>
        <h2 className="font-display text-[2.5rem] uppercase leading-[0.9]">{mode === "reset" ? copy.resetTitle : copy.title}</h2>
        <p className="mt-1.5 text-sm leading-6 text-slate-600">{mode === "reset" ? copy.resetDescription : copy.description}</p>
      </div>

      {loading ? <p className="text-sm text-slate-500">{copy.checking}</p> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="field-label">
          {copy.newPassword}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="password-rules"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 hover:text-navy-950"
            aria-label={visible ? copy.hide : copy.show}
            aria-pressed={visible}
          >
            {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password_confirm" className="field-label">
          {copy.repeatPassword}
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className={inputClass}
        />
      </div>

      <ul id="password-rules" aria-label={copy.rulesTitle} className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={cn(
              "flex items-center gap-2 text-xs font-semibold transition-colors",
              checks[rule.key] ? "text-brand-700" : "text-slate-400"
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center",
                checks[rule.key] ? "bg-brand-500 text-white" : "border border-slate-300"
              )}
            >
              {checks[rule.key] ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>

      <button
        type="submit"
        disabled={!ready || loading || saving}
        className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-brand-500 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-blueGlow transition-colors hover:bg-blue-bright disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="h-4 w-4" aria-hidden="true" />}
        {copy.submit}
      </button>
    </form>
  );
}

async function resolvePostPasswordPath(supabase: ReturnType<typeof createSupabaseBrowserClient>) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return "/";

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = ((profile?.role ?? user.user_metadata?.role) || null) as AppRole | null;

  if (role === "admin") return "/admin";
  if (role === "agency") return "/agency";
  if (role === "club") return "/club";
  return "/";
}
