import { redirect } from "next/navigation";
import { getCurrentProfile, getRoleHome } from "@/lib/auth";

export default async function HomePage() {
  const context = await getCurrentProfile();

  if (!context) redirect("/login");

  redirect(getRoleHome(context.profile.role));
}
