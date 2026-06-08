"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function readRequired(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
}

export async function revokeClubUserAction(formData: FormData) {
  await requireAdmin();
  const userId = readRequired(formData, "user_id");
  const clubId = readRequired(formData, "club_id");

  try {
    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
  } catch {
    redirect(`/admin/clubs/${clubId}?error=revoke`);
  }

  revalidatePath(`/admin/clubs/${clubId}`);
  revalidatePath("/admin/users");
  redirect(`/admin/clubs/${clubId}?revoked=1`);
}

export async function deleteClubAction(formData: FormData) {
  await requireAdmin();
  const clubId = readRequired(formData, "club_id");
  const clubName = readRequired(formData, "club_name");
  const confirmation = readRequired(formData, "confirmation");

  if (confirmation !== clubName) {
    redirect(`/admin/clubs/${clubId}?error=confirm`);
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const { data: users = [], error: usersError } = await adminClient
      .from("users")
      .select("id")
      .eq("club_id", clubId);

    if (usersError) throw usersError;

    for (const user of users || []) {
      const { error } = await adminClient.auth.admin.deleteUser(user.id);
      if (error) throw error;
    }

    const { error: clubError } = await adminClient.from("clubs").delete().eq("id", clubId);
    if (clubError) throw clubError;
  } catch {
    redirect(`/admin/clubs/${clubId}?error=delete`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  redirect("/admin?deletedClub=1");
}
