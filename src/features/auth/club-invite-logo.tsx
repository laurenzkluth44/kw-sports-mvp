"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

// Shown in the white badge on the set-password page. Defaults to the KW Sports logo,
// then upgrades to the invited club's logo once the invite session is hydrated.
export function ClubInviteLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let active = true;

    async function resolveClubLogo(): Promise<boolean> {
      const { data } = await supabase.auth.getSession();
      const clubId = data.session?.user?.user_metadata?.club_id as string | undefined;
      if (!clubId || !base) return false;
      if (active) setLogoUrl(`${base}/storage/v1/object/public/club-logos/${clubId}/logo.webp`);
      return true;
    }

    // The set-password form hydrates the session from the invite URL on mount,
    // so poll briefly until the club_id is available.
    async function poll() {
      for (let attempt = 0; attempt < 10 && active; attempt += 1) {
        if (await resolveClubLogo()) return;
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    poll();
    return () => {
      active = false;
    };
  }, []);

  if (logoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt="Vereinslogo"
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src="/kw-sports-logo.png"
      alt="KW Sports"
      width={1000}
      height={326}
      className="h-full w-full object-contain"
      priority
    />
  );
}
