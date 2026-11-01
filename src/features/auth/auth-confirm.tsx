"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import type { ConfirmCopy } from "@/lib/auth-i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSafeNextPath } from "@/lib/safe-redirect";

type TokenLink = { tokenHash: string; type: "invite" | "recovery"; next: string };

export function AuthConfirm({ copy }: { copy: ConfirmCopy }) {
  const [message, setMessage] = useState(copy.checking);
  const [tokenLink, setTokenLink] = useState<TokenLink | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Links from KW's own emails carry a token hash. It is only redeemed on click, so mail
  // security scanners that open links in advance can't use up the one-time token.
  async function redeemToken() {
    if (!tokenLink) return;
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenLink.tokenHash, type: tokenLink.type });
    if (error) {
      console.error("Token verification failed", error);
      setBusy(false);
      setFailed(true);
      return;
    }
    window.location.replace(tokenLink.next);
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function confirmAuthRedirect() {
      const searchParams = new URLSearchParams(window.location.search);
      const tokenHash = searchParams.get("token_hash");
      const tokenType = searchParams.get("type");
      if (tokenHash && (tokenType === "invite" || tokenType === "recovery")) {
        setTokenLink({ tokenHash, type: tokenType, next: getSafeNextPath(searchParams.get("next")) });
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const next = getSafeNextPath(searchParams.get("next"));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const code = searchParams.get("code");

      try {
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) throw error;
          window.location.replace(next);
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          window.location.replace(next);
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (data.session) {
          window.location.replace(next);
          return;
        }

        throw new Error("Missing invite session");
      } catch (error) {
        console.error("Auth confirmation failed", error);
        setMessage(copy.failed);
        window.setTimeout(() => window.location.replace("/login?error=invite"), 2500);
      }
    }

    confirmAuthRedirect();
  }, [copy.failed]);

  if (tokenLink) {
    const isReset = tokenLink.type === "recovery";
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-[2.75rem] uppercase leading-[0.9]">{isReset ? copy.resetTitle : copy.inviteTitle}</h2>
        <p className="text-sm leading-6 text-slate-600">{isReset ? copy.resetBody : copy.inviteBody}</p>
        {failed ? <div className="alert-error">{copy.failed}</div> : null}
        <button
          type="button"
          onClick={redeemToken}
          disabled={busy || failed}
          className="mt-1 inline-flex min-h-[52px] items-center justify-center gap-2 bg-brand-500 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-blueGlow transition-colors hover:bg-blue-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {isReset ? copy.resetButton : copy.inviteButton}
          {busy ? null : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
        {failed ? (
          <a href={isReset ? "/forgot-password" : "/login"} className="text-xs font-bold text-brand-600 hover:text-brand-700">
            {isReset ? copy.newLink : copy.toLogin} →
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden="true" />
      <p className="text-sm font-semibold text-navy-950">{message}</p>
    </div>
  );
}
