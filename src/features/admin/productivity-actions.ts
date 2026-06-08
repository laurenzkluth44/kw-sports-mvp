"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export async function createAdminNoteAction(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const playerNeedId = String(formData.get("player_need_id") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!playerNeedId || !body) redirect(playerNeedId ? `/admin/needs/${playerNeedId}?error=note` : "/admin");

  const { error } = await supabase.from("admin_notes").insert({
    player_need_id: playerNeedId,
    admin_id: profile.id,
    body
  });

  if (error) redirect(`/admin/needs/${playerNeedId}?error=note`);

  revalidatePath(`/admin/needs/${playerNeedId}`);
  redirect(`/admin/needs/${playerNeedId}`);
}
