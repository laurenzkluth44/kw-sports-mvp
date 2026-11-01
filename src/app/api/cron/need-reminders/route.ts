import { NextResponse, type NextRequest } from "next/server";
import { sendStaleNeedReminders } from "@/lib/email/notifications";

export const dynamic = "force-dynamic";

/**
 * Monthly "still current?" email to clubs (Vercel Cron, see vercel.json).
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; without the secret configured the job refuses to run.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const clubsEmailed = await sendStaleNeedReminders();
  return NextResponse.json({ clubsEmailed });
}
