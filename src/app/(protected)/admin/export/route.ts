import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { normalizeAdminNeedFilters } from "@/features/admin/filters";
import { buildNeedExportTable } from "@/features/admin/export-table";
import type { PlayerNeedWithClub } from "@/types/domain";

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value).replaceAll('"', '""');
  return `"${stringValue}"`;
}

export async function GET(request: NextRequest) {
  const context = await getCurrentProfile();

  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (context.profile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const filters = normalizeAdminNeedFilters(Object.fromEntries(request.nextUrl.searchParams.entries()));

  let query = context.supabase
    .from("player_needs")
    .select("*, clubs!inner(id,name,country,league,city,website,created_at,updated_at)")
    .order("created_at", { ascending: false });

  if (filters.q) query = query.ilike("clubs.name", `%${filters.q}%`);
  if (filters.country) query = query.eq("clubs.country", filters.country);
  if (filters.league) query = query.eq("clubs.league", filters.league);
  if (filters.season) query = query.eq("season", filters.season);
  if (filters.position) query = query.eq("position", filters.position);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);

  const { data = [] } = await query;
  const needs = data as PlayerNeedWithClub[];
  const csv = buildNeedExportTable(needs).map((row) => row.map(csvCell).join(",")).join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kw-sports-bedarfe-${date}.csv"`
    }
  });
}
