"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSafeNextPath } from "@/lib/safe-redirect";

export function AuthConfirm() {
  const [message, setMessage] = useState("Einladung wird geprüft...");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function confirmAuthRedirect() {
      const searchParams = new URLSearchParams(window.location.search);
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
        setMessage("Einladung konnte nicht geprüft werden. Du wirst zum Login weitergeleitet.");
        window.setTimeout(() => window.location.replace("/login?error=invite"), 1200);
      }
    }

    confirmAuthRedirect();
  }, []);

  return (
    <div className="panel flex flex-col items-center gap-4 border-l-2 border-l-brand-500 p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden="true" />
      <p className="text-sm font-semibold text-navy-950">{message}</p>
    </div>
  );
}
