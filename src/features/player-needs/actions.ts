"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireClubUser } from "@/lib/auth";
import { isValidDateString, parseClubId, parseNeedFormData, parseStatus } from "@/features/player-needs/form-schema";

function readId(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Missing id");
  return id;
}

function readOptionalNote(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  return value ? value : null;
}

function readDateIso(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  if (!value) return null;
  if (!isValidDateString(value)) throw new Error(`${key} must be a date`);

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`${key} must be a date`);
  return date.toISOString();
}

function statusTimestamps(status: string | undefined, formData?: FormData) {
  const now = new Date().toISOString();
  const isClosedStatus = status === "besetzt" || status === "archiviert";

  return {
    closed_at: isClosedStatus ? readDateIso(formData || new FormData(), "closed_at_date") || now : null,
    last_confirmed_at: now
  };
}

export async function createClubNeedAction(formData: FormData) {
  const { supabase, profile } = await requireClubUser();

  try {
    const payload = parseNeedFormData(formData);
    const { error } = await supabase.from("player_needs").insert({
      ...payload,
      ...statusTimestamps(payload.status, formData),
      club_id: profile.club_id!
    });

    if (error) throw error;
  } catch {
    redirect("/club/needs/new?error=save");
  }

  revalidatePath("/club");
  redirect("/club");
}

export async function updateClubNeedAction(formData: FormData) {
  const { supabase, profile } = await requireClubUser();
  const id = readId(formData);

  try {
    const payload = parseNeedFormData(formData);
    const { error } = await supabase
      .from("player_needs")
      .update({
        ...payload,
        ...statusTimestamps(payload.status, formData)
      })
      .eq("id", id)
      .eq("club_id", profile.club_id!);

    if (error) throw error;
  } catch {
    redirect(`/club/needs/${id}/edit?error=save`);
  }

  revalidatePath("/club");
  redirect("/club");
}

export async function updateClubNeedStatusAction(formData: FormData) {
  const { supabase, profile } = await requireClubUser();
  const id = readId(formData);

  try {
    const status = parseStatus(formData);
    const { error } = await supabase
      .from("player_needs")
      .update({
        status,
        ...(formData.has("status_note") ? { status_note: readOptionalNote(formData, "status_note") } : {}),
        ...statusTimestamps(status, formData)
      })
      .eq("id", id)
      .eq("club_id", profile.club_id!);

    if (error) throw error;
  } catch {
    redirect("/club?error=status");
  }

  revalidatePath("/club");
  redirect("/club");
}

export async function duplicateClubNeedAction(formData: FormData) {
  const { supabase, profile } = await requireClubUser();
  const id = readId(formData);
  let copyId = "";

  try {
    const { data: source, error: sourceError } = await supabase
      .from("player_needs")
      .select("*")
      .eq("id", id)
      .eq("club_id", profile.club_id!)
      .single();

    if (sourceError || !source) throw sourceError;

    const { data: copy, error: insertError } = await supabase
      .from("player_needs")
      .insert({
        club_id: profile.club_id!,
        season: source.season,
        position: source.position,
        needed_from_date: source.needed_from_date,
        priority: source.priority,
        status: "offen",
        description: source.description,
        age_min: source.age_min,
        age_max: source.age_max,
        height_min: source.height_min,
        nationality_preference: source.nationality_preference,
        league_experience: source.league_experience,
        player_type: source.player_type,
        contract_status_preference: source.contract_status_preference,
        budget_amount: source.budget_amount,
        budget_currency: source.budget_currency,
        budget_note: source.budget_note
      })
      .select("id")
      .single();

    if (insertError || !copy) throw insertError;
    copyId = copy.id;
  } catch {
    redirect("/club?error=duplicate");
  }

  revalidatePath("/club");
  redirect(`/club/needs/${copyId}/edit`);
}

export async function createAdminNeedAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  let needId = "";

  try {
    const clubId = parseClubId(formData);
    const payload = parseNeedFormData(formData);
    const { data, error } = await supabase
      .from("player_needs")
      .insert({
        ...payload,
        ...statusTimestamps(payload.status, formData),
        club_id: clubId
      })
      .select("id")
      .single();

    if (error || !data) throw error;
    needId = data.id;
  } catch {
    redirect("/admin/needs/new?error=save");
  }

  revalidatePath("/admin");
  redirect(`/admin/needs/${needId}`);
}

export async function updateAdminNeedAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = readId(formData);

  try {
    const clubId = parseClubId(formData);
    const payload = parseNeedFormData(formData);
    const { error } = await supabase
      .from("player_needs")
      .update({
        ...payload,
        ...statusTimestamps(payload.status, formData),
        club_id: clubId
      })
      .eq("id", id);

    if (error) throw error;
  } catch {
    redirect(`/admin/needs/${id}/edit?error=save`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/needs/${id}`);
  redirect(`/admin/needs/${id}`);
}
