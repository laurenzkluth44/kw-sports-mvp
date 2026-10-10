"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireClubUser, type AuthedContext } from "@/lib/auth";
import {
  isValidDateString,
  needFormErrorCode,
  parseClubId,
  parseConfidentialNote,
  parseNeedFormData,
  parseStatus
} from "@/features/player-needs/form-schema";

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

// Kept in its own table so agencies never receive it (RLS: admins + owning club only).
async function saveConfidentialNote(supabase: AuthedContext["supabase"], needId: string, note: string | null) {
  const { error } = note
    ? await supabase
        .from("player_need_confidential")
        .upsert({ player_need_id: needId, note }, { onConflict: "player_need_id" })
    : await supabase.from("player_need_confidential").delete().eq("player_need_id", needId);

  if (error) throw error;
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
    const confidentialNote = parseConfidentialNote(formData);
    const { data, error } = await supabase
      .from("player_needs")
      .insert({
        ...payload,
        ...statusTimestamps(payload.status, formData),
        club_id: profile.club_id!
      })
      .select("id")
      .single();

    if (error || !data) throw error;
    if (confidentialNote) await saveConfidentialNote(supabase, data.id, confidentialNote);
  } catch (error) {
    redirect(`/club/needs/new?error=${needFormErrorCode(error)}`);
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
    await saveConfidentialNote(supabase, id, parseConfidentialNote(formData));
  } catch (error) {
    redirect(`/club/needs/${id}/edit?error=${needFormErrorCode(error)}`);
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
      .select("*, player_need_confidential(note)")
      .eq("id", id)
      .eq("club_id", profile.club_id!)
      .single();

    if (sourceError || !source) throw sourceError;

    const { data: copy, error: insertError } = await supabase
      .from("player_needs")
      .insert({
        club_id: profile.club_id!,
        season: source.season,
        need_type: source.need_type,
        attack_positions: source.attack_positions,
        defense_positions: source.defense_positions,
        coach_role: source.coach_role,
        needed_from_date: source.needed_from_date,
        priority: source.priority,
        status: "offen",
        description: source.description,
        age_min: source.age_min,
        age_max: source.age_max,
        height_min: source.height_min,
        nationality_preference: source.nationality_preference,
        languages: source.languages,
        league_experience: source.league_experience,
        player_type: source.player_type,
        player_types: source.player_types,
        target_roles: source.target_roles,
        contract_status_preference: source.contract_status_preference,
        budget_amount: source.budget_amount,
        budget_currency: source.budget_currency,
        budget_note: source.budget_note
      })
      .select("id")
      .single();

    if (insertError || !copy) throw insertError;
    copyId = copy.id;

    const sourceNote = source.player_need_confidential?.note ?? null;
    if (sourceNote) await saveConfidentialNote(supabase, copy.id, sourceNote);
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
    const confidentialNote = parseConfidentialNote(formData);
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
    if (confidentialNote) await saveConfidentialNote(supabase, needId, confidentialNote);
  } catch (error) {
    redirect(`/admin/needs/new?error=${needFormErrorCode(error)}`);
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
    await saveConfidentialNote(supabase, id, parseConfidentialNote(formData));
  } catch (error) {
    redirect(`/admin/needs/${id}/edit?error=${needFormErrorCode(error)}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/needs/${id}`);
  redirect(`/admin/needs/${id}`);
}
