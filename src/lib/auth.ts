import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/types/domain";

export type AuthedContext = {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  profile: Profile;
};

export function getRoleHome(role: AppRole) {
  if (role === "admin") return "/admin";
  if (role === "agency") return "/agency";
  return "/club";
}

export async function getCurrentProfile(): Promise<AuthedContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("users")
    .select("*, clubs(*)")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return {
    supabase,
    profile: profile as Profile
  };
}

export async function requireUser(): Promise<AuthedContext> {
  const context = await getCurrentProfile();
  if (!context) redirect("/login");

  return context;
}

export async function requireRole(role: AppRole): Promise<AuthedContext> {
  const context = await requireUser();

  if (context.profile.role !== role) {
    redirect(getRoleHome(context.profile.role));
  }

  return context;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireAgency() {
  const context = await requireRole("agency");

  if (!context.profile.agency_name) {
    redirect("/login?error=missing-agency");
  }

  return context;
}

export async function requireClubUser() {
  const context = await requireRole("club");

  if (!context.profile.club_id) {
    redirect("/login?error=missing-club");
  }

  return context;
}
