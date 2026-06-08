"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
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

  let adminClient: ReturnType<typeof createSupabaseAdminClient>;

  try {
    adminClient = createSupabaseAdminClient();
  } catch (error) {
    console.error("Invite configuration error", error);
    redirect("/admin/users?error=invite_config");
  }

  try {
    const { data, error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        name,
        role,
        club_id: role === "club" ? clubId : null
      },
      redirectTo: `${getSiteUrl()}/set-password`
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
      if (profileError.code === "23505") {
        console.error("Invite profile conflict", profileError);
        throw new Error("User already exists");
      }

      await adminClient.auth.admin.deleteUser(data.user.id);
      throw profileError;
    }
  } catch (error) {
    console.error("Invite user error", error);
    redirect(`/admin/users?error=${getInviteErrorCode(error)}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?invited=1");
}

function getInviteErrorCode(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || "").toLowerCase();

  if (message.includes("already") || message.includes("registered") || message.includes("exists")) return "invite_exists";
  if (message.includes("redirect") || message.includes("site url") || message.includes("not allowed")) return "invite_url";
  if (
    message.includes("smtp") ||
    message.includes("email address not authorized") ||
    message.includes("rate limit") ||
    message.includes("send email")
  ) {
    return "invite_smtp";
  }

  return "invite";
}
