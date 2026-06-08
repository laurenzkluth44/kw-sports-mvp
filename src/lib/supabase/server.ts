import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // Server Components cannot set cookies. Middleware refreshes sessions.
      }
    }
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods
    }
  );
}
