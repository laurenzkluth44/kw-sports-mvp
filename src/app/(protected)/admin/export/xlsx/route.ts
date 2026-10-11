import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { applyNeedFilters, normalizeAdminNeedFilters } from "@/features/admin/filters";
import { buildNeedExportTable, type ExportNeed } from "@/features/admin/export-table";
import { createXlsxWorkbook } from "@/lib/xlsx";

export async function GET(request: NextRequest) {
  const context = await getCurrentProfile();

  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (context.profile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const filters = normalizeAdminNeedFilters(Object.fromEntries(request.nextUrl.searchParams.entries()));

  const query = context.supabase
    .from("player_needs")
    .select("*, clubs!inner(id,name,country,league,city,website,created_at,updated_at), player_need_confidential(note)")
    .order("created_at", { ascending: false });

  const { data = [] } = await applyNeedFilters(query, filters);
  const workbook = createXlsxWorkbook(buildNeedExportTable(data as ExportNeed[]));
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="kw-sports-bedarfe-${date}.xlsx"`
    }
  });
}
