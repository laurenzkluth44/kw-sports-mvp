import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getClubLocale } from "@/lib/club-locale";
import { squadImportCopy } from "@/lib/squad-import-i18n";
import { createXlsxWorkbook } from "@/lib/xlsx";

/** Empty squad template with two example rows, in the club's language. */
export async function GET() {
  const context = await getCurrentProfile();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (context.profile.role !== "club") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const t = squadImportCopy[await getClubLocale()];
  const workbook = createXlsxWorkbook(
    [[...t.templateHeaders], ...t.templateExample.map((row) => [...row])],
    t.templateName.slice(0, 31)
  );
  const fileName = `${t.templateName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.xlsx`;

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
