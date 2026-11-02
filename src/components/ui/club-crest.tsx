import { cn } from "@/lib/utils";

export function clubInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function clubLogoUrl(logoPath: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return logoPath && base ? `${base}/storage/v1/object/public/club-logos/${logoPath}` : null;
}

const SIZES = {
  sm: { box: "h-8 w-8 text-sm", bracket: "-left-1 -top-1 h-2.5 w-2.5" },
  md: { box: "h-11 w-11 text-lg", bracket: "-left-1 -top-1 h-3 w-3" },
  lg: { box: "h-14 w-14 text-2xl", bracket: "-left-1.5 -top-1.5 h-4 w-4" },
  xl: { box: "h-16 w-16 text-2xl sm:h-20 sm:w-20 sm:text-3xl", bracket: "-left-1.5 -top-1.5 h-4 w-4" }
} as const;

/**
 * A club's crest as a square tile. Uploaded logos often carry their own white background,
 * so instead of hiding it the logo always sits on a deliberate white tile; on dark surfaces
 * the tile gets the KW blue corner (like player photos), so it reads as a badge, not a blob.
 * Without a logo, the same tile shows the initials.
 */
export function ClubCrest({
  name,
  logoUrl,
  size = "md",
  tone = "light",
  className
}: {
  name: string;
  logoUrl?: string | null;
  size?: keyof typeof SIZES;
  tone?: "light" | "dark";
  className?: string;
}) {
  const s = SIZES[size];
  const dark = tone === "dark";

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {dark ? <span aria-hidden="true" className={cn("absolute z-10 border-l-2 border-t-2 border-brand-500", s.bracket)} /> : null}
      {logoUrl ? (
        <span
          className={cn(
            "flex items-center justify-center overflow-hidden bg-white",
            dark ? "shadow-[0_6px_20px_rgba(0,0,0,0.35)]" : "ring-1 ring-slate-200",
            s.box
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={name} className="h-[84%] w-[84%] object-contain" />
        </span>
      ) : (
        <span
          role="img"
          aria-label={name}
          className={cn(
            "flex items-center justify-center font-display leading-none",
            dark ? "border border-white/25 bg-white/[0.06] text-white" : "bg-navy-950 text-white",
            s.box
          )}
        >
          {clubInitials(name)}
        </span>
      )}
    </span>
  );
}
