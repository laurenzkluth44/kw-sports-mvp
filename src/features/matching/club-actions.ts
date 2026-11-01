"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClubUser } from "@/lib/auth";

const UUID = /^[0-9a-f-]{36}$/i;

/** Club answers a KW suggestion. All checks (own need, released player, allowed answers) live in the database function. */
export async function respondToMatchAction(formData: FormData) {
  const { supabase } = await requireClubUser();
  const matchId = String(formData.get("match_id") ?? "");
  const answer = String(formData.get("answer") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);

  if (!UUID.test(matchId) || (answer !== "interessiert" && answer !== "kein_interesse")) {
    redirect("/club/suggestions?error=respond");
  }

  const { error } = await supabase.rpc("respond_to_need_match", {
    match_id: matchId,
    answer,
    note: note || null
  });

  if (error) redirect(`/club/suggestions?error=respond#match-${matchId}`);

  revalidatePath("/club", "layout");
  redirect(`/club/suggestions?done=${answer}#match-${matchId}`);
}
