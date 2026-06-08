import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { normalizeAdminNeedFilters } from "@/features/admin/filters";
import { buildNeedExportTable } from "@/features/admin/export-table";
import { createXlsxWorkbook } from "@/lib/xlsx";
import type { PlayerNeedWithClub } from "@/types/domain";

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
  if (filters.league) query = query.eq("clubs.league", filters.league);
  if (filters.season) query = query.eq("season", filters.season);
  if (filters.position) query = query.eq("position", filters.position);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);

  const { data = [] } = await query;
  const workbook = createXlsxWorkbook(buildNeedExportTable(data as PlayerNeedWithClub[]));
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="kw-sports-bedarfe-${date}.xlsx"`
    }
  });
}
