"use server";

import { redirect } from "next/navigation";
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
