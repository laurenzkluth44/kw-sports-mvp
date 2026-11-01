"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, type AuthedContext } from "@/lib/auth";
import { ATTACK_POSITIONS, COACH_ROLES, DEFENSE_POSITIONS, LANGUAGES, PLAYER_TYPES } from "@/lib/constants";
import { isValidDateString } from "@/features/player-needs/form-schema";
import { scorePlayerForNeed } from "@/features/matching/engine";
import type { Json } from "@/types/database";
import type { KwPlayer, PlayerNeed } from "@/types/domain";

const BUCKET = "kw-players";
const MAX_CV_BYTES = 10 * 1024 * 1024;
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

class PlayerFormError extends Error {
  constructor(public code: "save" | "consent" | "file") {
    super(code);
  }
}

function text(formData: FormData, key: string, max = 200) {
  const value = String(formData.get(key) || "").trim();
  if (value.length > max) throw new PlayerFormError("save");
  return value || null;
}

function date(formData: FormData, key: string) {
  const value = text(formData, key, 10);
  if (value && !isValidDateString(value)) throw new PlayerFormError("save");
  return value;
}

function list<T extends string | number>(formData: FormData, key: string, allowed: readonly T[]) {
  const values = formData.getAll(key).map(String);
  return allowed.filter((option) => values.includes(String(option)));
}

function parsePlayerForm(formData: FormData) {
  const kind = formData.get("need_type") === "trainer" ? "trainer" : "spieler";
  const firstName = text(formData, "first_name", 80);
  const lastName = text(formData, "last_name", 80);
  if (!firstName || !lastName) throw new PlayerFormError("save");

  const heightRaw = text(formData, "height_cm", 3);
  const height = heightRaw ? Number(heightRaw) : null;
  if (height !== null && (!Number.isInteger(height) || height < 140 || height > 230)) throw new PlayerFormError("save");

  const handedness = text(formData, "handedness", 12);
  if (handedness && !["links", "rechts", "beidhaendig"].includes(handedness)) throw new PlayerFormError("save");

  const videoUrl = text(formData, "video_url", 500);
  if (videoUrl && !videoUrl.startsWith("https://")) throw new PlayerFormError("save");

  const consentAt = date(formData, "consent_at");
  const visible = formData.get("visible_to_clubs") === "on";
  if (visible && !consentAt) throw new PlayerFormError("consent");

  return {
    kind: kind as KwPlayer["kind"],
    first_name: firstName,
    last_name: lastName,
    birth_date: date(formData, "birth_date"),
    nationality: text(formData, "nationality", 80),
    attack_positions: kind === "trainer" ? [] : list(formData, "attack_positions", ATTACK_POSITIONS),
    defense_positions: kind === "trainer" ? [] : list(formData, "defense_positions", DEFENSE_POSITIONS),
    coach_roles: kind === "trainer" ? list(formData, "coach_roles", COACH_ROLES) : [],
    handedness,
    height_cm: kind === "trainer" ? null : height,
    current_club: text(formData, "current_club", 120),
    current_league: text(formData, "current_league", 120),
    contract_until: date(formData, "contract_until"),
    available_from: date(formData, "available_from"),
    languages: list(formData, "languages", LANGUAGES),
    player_types: kind === "trainer" ? [] : list(formData, "player_types", PLAYER_TYPES),
    league_experience: text(formData, "league_experience", 200),
    profile: text(formData, "profile", 2000),
    video_url: videoUrl,
    consent_at: consentAt,
    visible_to_clubs: visible
  };
}

/** Uploads a new photo / CV if one was chosen; returns the storage paths to save. */
async function uploadFiles(supabase: AuthedContext["supabase"], playerId: string, formData: FormData) {
  const paths: { photo_path?: string; cv_path?: string } = {};

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const ext = PHOTO_TYPES[photo.type];
    if (!ext || photo.size > MAX_PHOTO_BYTES) throw new PlayerFormError("file");
    const path = `${playerId}/photo.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, photo, { contentType: photo.type, upsert: true });
    if (error) throw error;
    paths.photo_path = path;
  }

  const cv = formData.get("cv");
  if (cv instanceof File && cv.size > 0) {
    if (cv.type !== "application/pdf" || cv.size > MAX_CV_BYTES) throw new PlayerFormError("file");
    const path = `${playerId}/cv.pdf`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, cv, { contentType: "application/pdf", upsert: true });
    if (error) throw error;
    paths.cv_path = path;
  }

  return paths;
}

function errorCode(error: unknown) {
  return error instanceof PlayerFormError ? error.code : "save";
}

export async function createKwPlayerAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  let id = "";

  try {
    const payload = parsePlayerForm(formData);
    const { data, error } = await supabase.from("kw_players").insert(payload).select("id").single();
    if (error || !data) throw error;
    id = data.id;
    const paths = await uploadFiles(supabase, id, formData);
    if (paths.photo_path || paths.cv_path) {
      const { error: pathError } = await supabase.from("kw_players").update(paths).eq("id", id);
      if (pathError) throw pathError;
    }
  } catch (error) {
    console.error("Create KW player failed", error);
    // The player row may exist already (e.g. a file was rejected): continue on its edit page.
    redirect(id ? `/admin/players/${id}/edit?error=${errorCode(error)}` : `/admin/players/new?error=${errorCode(error)}`);
  }

  revalidatePath("/admin/players");
  redirect("/admin/players?done=created");
}

export async function updateKwPlayerAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin/players");

  try {
    const payload = parsePlayerForm(formData);
    const paths = await uploadFiles(supabase, id, formData);
    const { error } = await supabase.from("kw_players").update({ ...payload, ...paths }).eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error("Update KW player failed", error);
    redirect(`/admin/players/${id}/edit?error=${errorCode(error)}`);
  }

  revalidatePath("/admin/players");
  redirect("/admin/players?done=updated");
}

export async function deleteKwPlayerAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin/players");

  try {
    const { data: player } = await supabase.from("kw_players").select("photo_path, cv_path").eq("id", id).single();
    const files = [player?.photo_path, player?.cv_path].filter((path): path is string => Boolean(path));
    if (files.length > 0) await supabase.storage.from(BUCKET).remove(files);
    const { error } = await supabase.from("kw_players").delete().eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error("Delete KW player failed", error);
    redirect(`/admin/players/${id}/edit?error=delete`);
  }

  revalidatePath("/admin/players");
  redirect("/admin/players?done=deleted");
}

/** KW approves a suggested player for a club need. Score and reasons are recomputed here, never taken from the form. */
export async function releaseNeedMatchAction(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const needId = String(formData.get("need_id") || "");
  const playerId = String(formData.get("player_id") || "");

  try {
    const [{ data: need }, { data: player }] = await Promise.all([
      supabase.from("player_needs").select("*").eq("id", needId).single(),
      supabase.from("kw_players").select("*").eq("id", playerId).single()
    ]);
    if (!need || !player) throw new Error("not found");
    if (!player.visible_to_clubs) throw new Error("player not released for clubs");

    const result = scorePlayerForNeed(need as PlayerNeed, player as KwPlayer);
    if (!result.eligible) throw new Error("player does not fit this need");

    const { error } = await supabase.from("need_matches").insert({
      need_id: needId,
      player_id: playerId,
      score: result.score,
      reasons: result.reasons as unknown as Json,
      released_by: profile.id
    });
    if (error) throw error;
  } catch (error) {
    console.error("Release match failed", error);
    redirect(`/admin/needs/${needId}?error=match#kw-spieler`);
  }

  revalidatePath(`/admin/needs/${needId}`);
  redirect(`/admin/needs/${needId}?done=released#kw-spieler`);
}

export async function withdrawNeedMatchAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const needId = String(formData.get("need_id") || "");
  const matchId = String(formData.get("match_id") || "");

  const { error } = await supabase.from("need_matches").delete().eq("id", matchId);
  if (error) {
    console.error("Withdraw match failed", error);
    redirect(`/admin/needs/${needId}?error=match#kw-spieler`);
  }

  revalidatePath(`/admin/needs/${needId}`);
  redirect(`/admin/needs/${needId}#kw-spieler`);
}
