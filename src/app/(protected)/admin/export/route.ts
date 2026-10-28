import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { applyNeedFilters, normalizeAdminNeedFilters } from "@/features/admin/filters";
import { buildNeedExportTable, type ExportNeed } from "@/features/admin/export-table";

// Text typed by clubs ends up here. Excel runs cells starting with = + - @ (or tab/CR)
// as formulas, so such text is prefixed with ' to force it to plain text.
// Real numbers are left alone so they stay numeric.
function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  let stringValue = String(value);
  if (typeof value !== "number" && /^[=+\-@\t\r]/.test(stringValue)) {
    stringValue = `'${stringValue}`;
  }
  return `"${stringValue.replaceAll('"', '""')}"`;
}

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
  const needs = data as ExportNeed[];
  const csv = buildNeedExportTable(needs).map((row) => row.map(csvCell).join(",")).join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kw-sports-bedarfe-${date}.csv"`
    }
  });
}
