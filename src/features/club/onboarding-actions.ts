"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireClubUser } from "@/lib/auth";
import { ONBOARDING_COOKIE } from "@/features/club/onboarding-model";

/** Hides the onboarding checklist on this browser. It comes back by itself only on a new device. */
export async function hideOnboardingAction() {
  await requireClubUser();
  const store = await cookies();
  store.set(ONBOARDING_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  redirect("/club");
}
