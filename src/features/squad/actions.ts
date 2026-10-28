"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClubUser } from "@/lib/auth";
import { ATTACK_POSITIONS, DEFENSE_POSITIONS, isValidSeason, seasonEndDate } from "@/lib/constants";
import type { AttackPosition, DefensePosition } from "@/types/domain";

// Every query below also runs under RLS, which limits club users to their own club's
// roster. The explicit club_id filters are a second safety net, not the only one.

class RosterFormError extends Error {}

function text(formData: FormData, key: string, maxLength: number) {
  const value = String(formData.get(key) || "").trim();
  if (value.length > maxLength) throw new RosterFormError(`${key} too long`);
  return value;
}

function isAttackPosition(value: string): value is AttackPosition {
  return (ATTACK_POSITIONS as readonly string[]).includes(value);
}

function parseRosterForm(formData: FormData) {
  const firstName = text(formData, "first_name", 80);
  const lastName = text(formData, "last_name", 80);
  const position = text(formData, "position", 4);
  const contractSeason = text(formData, "contract_season", 7);
  const jerseyRaw = text(formData, "jersey_number", 3);
  const notes = text(formData, "notes", 2000);

  if (!firstName || !lastName) throw new RosterFormError("name required");
  if (!isAttackPosition(position)) throw new RosterFormError("invalid position");
  if (!isValidSeason(contractSeason)) throw new RosterFormError("invalid contract season");

  let jerseyNumber: number | null = null;
  if (jerseyRaw) {
    jerseyNumber = Number(jerseyRaw);
    if (!Number.isInteger(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) {
      throw new RosterFormError("invalid jersey number");
    }
  }

  // The main position is dropped from the secondary list instead of being an error.
  const secondaryPositions = ATTACK_POSITIONS.filter(
    (value) => value !== position && formData.getAll("secondary_positions").map(String).includes(value)
  ) as AttackPosition[];

  const defenseValues = formData.getAll("defense_positions").map(Number);
  const defensePositions = DEFENSE_POSITIONS.filter((value) => defenseValues.includes(value)) as DefensePosition[];

  return {
    first_name: firstName,
    last_name: lastName,
    jersey_number: jerseyNumber,
    position,
    secondary_positions: secondaryPositions,
    defense_positions: defensePositions,
    contract_until: seasonEndDate(contractSeason),
    notes: notes || null
  };
}

function readId(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/club/squad");
  return id;
}

export async function createRosterPlayerAction(formData: FormData) {
  const { supabase, profile } = await requireClubUser();

  try {
    const payload = parseRosterForm(formData);
    const { error } = await supabase.from("roster_players").insert({ ...payload, club_id: profile.club_id! });
    if (error) throw error;
  } catch (error) {
    console.error("Create roster player failed", error);
    redirect("/club/squad/new?error=save");
  }

  revalidatePath("/club/squad");
  revalidatePath("/club");
  redirect("/club/squad?done=created");
}

export async function updateRosterPlayerAction(formData: FormData) {
  const { supabase, profile } = await requireClubUser();
  const id = readId(formData);

  try {
    const payload = parseRosterForm(formData);
    const { data, error } = await supabase
      .from("roster_players")
      .update(payload)
      .eq("id", id)
      .eq("club_id", profile.club_id!)
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) throw new RosterFormError("not found");
  } catch (error) {
    console.error("Update roster player failed", error);
    redirect(`/club/squad/${id}/edit?error=save`);
  }

  revalidatePath("/club/squad");
  revalidatePath("/club");
  redirect("/club/squad?done=saved");
}

export async function deleteRosterPlayerAction(formData: FormData) {
  const { supabase, profile } = await requireClubUser();
  const id = readId(formData);

  try {
    const { error } = await supabase.from("roster_players").delete().eq("id", id).eq("club_id", profile.club_id!);
    if (error) throw error;
  } catch (error) {
    console.error("Delete roster player failed", error);
    redirect(`/club/squad/${id}/edit?error=delete`);
  }

  revalidatePath("/club/squad");
  revalidatePath("/club");
  redirect("/club/squad?done=deleted");
}
