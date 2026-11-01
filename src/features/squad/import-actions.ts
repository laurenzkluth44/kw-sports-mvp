"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseRosterTable, validImportRow, normalize, type ImportResult } from "@/features/squad/import-parse";
import { requireClubUser } from "@/lib/auth";
import { readTableFile } from "@/lib/table-read";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 80;

export type SquadImportState =
  | { status: "idle" }
  | { status: "error"; code: "file" | "legacy" | "size" | "header" }
  | ({ status: "preview"; fileName: string } & Pick<ImportResult, "rows" | "skipped">);

/** Step 1: read the file and show what would be imported. Nothing is saved here. */
export async function previewSquadImportAction(_state: SquadImportState, formData: FormData): Promise<SquadImportState> {
  const { supabase, profile } = await requireClubUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "error", code: "file" };
  if (file.size > MAX_BYTES) return { status: "error", code: "size" };

  let table: string[][];
  try {
    table = readTableFile(Buffer.from(await file.arrayBuffer()), file.name);
  } catch (error) {
    return { status: "error", code: error instanceof Error && error.message === "legacy xls" ? "legacy" : "file" };
  }

  const { data } = await supabase.from("roster_players").select("first_name, last_name").eq("club_id", profile.club_id!);
  const result = parseRosterTable(table, data ?? []);
  if (!result.headerFound) return { status: "error", code: "header" };

  return { status: "preview", fileName: file.name.slice(0, 120), rows: result.rows.slice(0, MAX_ROWS), skipped: result.skipped };
}

/** Step 2: save the previewed rows. Every row is checked again on the server. */
export async function commitSquadImportAction(formData: FormData) {
  const { supabase, profile } = await requireClubUser();

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get("rows") || "[]"));
  } catch {
    redirect("/club/squad/import?error=save");
  }

  const { data: existing } = await supabase.from("roster_players").select("first_name, last_name").eq("club_id", profile.club_id!);
  const seen = new Set((existing ?? []).map((player) => `${normalize(player.first_name)}|${normalize(player.last_name)}`));
  const rows = (Array.isArray(parsed) ? parsed : [])
    .slice(0, MAX_ROWS)
    .map(validImportRow)
    .filter((row): row is NonNullable<ReturnType<typeof validImportRow>> => row !== null)
    .filter((row) => {
      const key = `${normalize(row.first_name)}|${normalize(row.last_name)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (rows.length === 0) redirect("/club/squad/import?error=save");

  const { error } = await supabase.from("roster_players").insert(rows.map((row) => ({ ...row, club_id: profile.club_id! })));
  if (error) {
    console.error("Squad import failed", error);
    redirect("/club/squad/import?error=save");
  }

  revalidatePath("/club", "layout");
  redirect(`/club/squad?done=imported&count=${rows.length}`);
}
