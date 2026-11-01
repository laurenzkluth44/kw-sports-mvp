"use server";

import { redirect } from "next/navigation";
import { parseAuthLocale } from "@/lib/auth-i18n";
import { authConfirmLink, buildResetEmail } from "@/lib/email/auth-emails";
import { emailEnabled, sendEmail } from "@/lib/email/send";
import { getAuthConfirmUrl } from "@/lib/site-url";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleHome } from "@/lib/auth";
import type { AppRole } from "@/types/domain";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect("/login?error=invalid");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=session");
  }

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = data as { role: AppRole } | null;

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login?error=profile");
  }

  redirect(getRoleHome(profile.role));
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const RESET_NEXT = "/set-password?mode=reset";

/**
 * "Passwort vergessen": always lands on the same "if an account exists…" message, so the form
 * can't be used to find out which emails have access. With email configured, KW's branded email
 * goes out; otherwise Supabase's own reset email.
 */
export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const locale = parseAuthLocale(String(formData.get("locale") || ""));
  if (!email || !email.includes("@")) redirect("/forgot-password?error=1");

  try {
    if (emailEnabled()) {
      const admin = createSupabaseAdminClient();
      const { data: profile } = await admin.from("users").select("id").eq("email", email).maybeSingle();
      if (profile) {
        const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });
        if (error || !data.properties?.hashed_token) throw error ?? new Error("no token");
        const link = authConfirmLink(data.properties.hashed_token, "recovery", RESET_NEXT);
        await sendEmail({ to: [email], ...buildResetEmail({ link, locale }) });
      }
    } else {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: getAuthConfirmUrl(RESET_NEXT) });
    }
  } catch (error) {
    console.error("Password reset request failed", error);
  }

  redirect("/forgot-password?sent=1");
}
