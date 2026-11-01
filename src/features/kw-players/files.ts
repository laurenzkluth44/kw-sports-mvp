import type { AuthedContext } from "@/lib/auth";

/**
 * Short-lived links to private player files (photos, CV PDFs). Created with the signed-in
 * user's session, so storage access rules apply: clubs only get links for players
 * KW released to them.
 */
export async function signedFileUrls(supabase: AuthedContext["supabase"], paths: (string | null | undefined)[], seconds = 600) {
  const unique = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (unique.length === 0) return new Map<string, string>();

  const { data } = await supabase.storage.from("kw-players").createSignedUrls(unique, seconds);
  const urls = new Map<string, string>();
  (data ?? []).forEach((item) => {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  });
  return urls;
}
