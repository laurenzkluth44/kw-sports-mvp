"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { sendTestEmail } from "./server";

/** Sends the branded test email to the signed-in admin and reports Resend's answer on the page. */
export async function sendTestEmailAction() {
  const { profile } = await requireAdmin();
  const result = await sendTestEmail(profile.email);
  const params = new URLSearchParams(result.ok ? { test: "sent" } : { test: "failed", detail: result.message.slice(0, 300) });
  redirect(`/admin/system?${params.toString()}#email`);
}
