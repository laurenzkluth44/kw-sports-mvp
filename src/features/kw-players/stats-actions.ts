"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isValidDateString } from "@/features/player-needs/form-schema";

const UUID = /^[0-9a-f-]{36}$/i;

function count(formData: FormData, key: string, max = 999) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > max) throw new Error("invalid");
  return value;
}

function decimal(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < -99 || value > 99) throw new Error("invalid");
  return Math.round(value * 10) / 10;
}

function back(playerId: string, result: "saved" | "deleted" | "error") {
  return `/admin/players/${playerId}/edit?stats=${result}#statistik`;
}

/** Adds a game (or a summary row) or overwrites the row with the same competition and date. */
export async function saveKwPlayerGameAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const playerId = String(formData.get("player_id") ?? "");
  if (!UUID.test(playerId)) redirect("/admin/players");

  let ok = true;
  try {
    const competition = String(formData.get("competition") ?? "").trim().slice(0, 60);
    const gameDate = String(formData.get("game_date") ?? "").trim();
    if (!competition || !isValidDateString(gameDate)) throw new Error("invalid");
    const game = String(formData.get("game") ?? "").trim().slice(0, 120) || null;

    const { error } = await supabase.from("kw_player_games").upsert(
      {
        player_id: playerId,
        competition,
        game_date: gameDate,
        game,
        games: count(formData, "games", 99) ?? 1,
        goals: count(formData, "goals"),
        shots: count(formData, "shots"),
        seven_goals: count(formData, "seven_goals"),
        assists: count(formData, "assists"),
        steals: count(formData, "steals"),
        blocks: count(formData, "blocks"),
        turnovers: count(formData, "turnovers"),
        two_min: count(formData, "two_min"),
        hpi: decimal(formData, "hpi"),
        saves: count(formData, "saves"),
        goals_against: count(formData, "goals_against"),
        source: "Manuell (Admin)"
      },
      { onConflict: "player_id,competition,game_date" }
    );
    if (error) throw error;
  } catch {
    ok = false;
  }

  revalidatePath(`/admin/players/${playerId}/edit`);
  redirect(back(playerId, ok ? "saved" : "error"));
}

export async function deleteKwPlayerGameAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const playerId = String(formData.get("player_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(playerId) || !UUID.test(id)) redirect("/admin/players");

  const { error } = await supabase.from("kw_player_games").delete().eq("id", id).eq("player_id", playerId);
  revalidatePath(`/admin/players/${playerId}/edit`);
  redirect(back(playerId, error ? "error" : "deleted"));
}
