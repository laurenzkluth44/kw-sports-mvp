"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/types/domain";

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "") as AppRole;
  const clubId = String(formData.get("club_id") || "").trim() || null;

  if (!name || !email || !password || !["admin", "club"].includes(role)) {
    redirect("/admin/users?error=validation");
  }

  if (role === "club" && !clubId) {
    redirect("/admin/users?error=club");
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        club_id: role === "club" ? clubId : null
      }
    });

    if (authError || !data.user) throw authError;

    const { error: profileError } = await adminClient.from("users").insert({
      id: data.user.id,
      name,
      email,
      role,
      club_id: role === "club" ? clubId : null
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(data.user.id);
      throw profileError;
    }
  } catch {
    redirect("/admin/users?error=service");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function inviteUserAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("invite_name") || "").trim();
  const email = String(formData.get("invite_email") || "").trim().toLowerCase();
  const role = String(formData.get("invite_role") || "") as AppRole;
  const clubId = String(formData.get("invite_club_id") || "").trim() || null;

  if (!name || !email || !["admin", "club"].includes(role)) {
    redirect("/admin/users?error=validation");
  }

  if (role === "club" && !clubId) {
    redirect("/admin/users?error=club");
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const { data, error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        name,
        role,
        club_id: role === "club" ? clubId : null
      },
      redirectTo: siteUrl ? `${siteUrl}/login` : undefined
    });

    if (authError || !data.user) throw authError;

    const { error: profileError } = await adminClient.from("users").insert({
      id: data.user.id,
      name,
      email,
      role,
      club_id: role === "club" ? clubId : null
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(data.user.id);
      throw profileError;
    }
  } catch {
    redirect("/admin/users?error=invite");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?invited=1");
}
