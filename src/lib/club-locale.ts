import { cookies } from "next/headers";
import { CLUB_LOCALE_COOKIE, parseClubLocale } from "@/lib/club-i18n";

export async function getClubLocale() {
  const cookieStore = await cookies();
  return parseClubLocale(cookieStore.get(CLUB_LOCALE_COOKIE)?.value);
}
