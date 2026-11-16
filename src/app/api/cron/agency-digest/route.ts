import { NextResponse, type NextRequest } from "next/server";
import { sendAgencyDigest } from "@/lib/email/notifications";

export const dynamic = "force-dynamic";

/**
 * Monday digest for partner agencies: the needs added in the last 7 days (Vercel Cron, see vercel.json).
 * Same protection as the monthly reminder: only runs with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const emailsSent = await sendAgencyDigest();
  return NextResponse.json({ emailsSent });
}
