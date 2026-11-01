import Link from "next/link";
import { ATTACK_POSITIONS } from "@/lib/constants";
import { COURT_ASPECT, CourtLines, attackSpot, defenseSpot } from "@/features/court/court";
import { attackPositionsText, defensePositionsText, hasNeedPosition, needHeadline, needProfileLabels } from "@/features/player-needs/need-summary";
import { CLUB_PRIORITY_LABELS, CLUB_STATUS_LABELS, clubCopy, type ClubLocale } from "@/lib/club-i18n";
import type { OverviewCopy } from "@/lib/overview-i18n";
import { cn, formatDate } from "@/lib/utils";
import type { PlayerNeedWithClub, Priority } from "@/types/domain";

const STALE_DAYS = 30;

export const PRIORITY_TAG: Record<Priority, string> = {
  hoch: "bg-brand-500 text-white",
  mittel: "bg-white text-brand-700 ring-1 ring-inset ring-brand-500",
  niedrig: "bg-slate-100 text-slate-600"
};

export function clubInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function isStale(need: Pick<PlayerNeedWithClub, "status" | "last_confirmed_at">, today = new Date()) {
  if (need.status === "besetzt" || need.status === "archiviert") return false;
  const confirmed = new Date(need.last_confirmed_at).getTime();
  return !Number.isNaN(confirmed) && today.getTime() - confirmed > STALE_DAYS * 24 * 60 * 60 * 1000;
}

export function ClubCrest({ name, logoUrl, size = "md" }: { name: string; logoUrl?: string | null; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-14 w-14 text-2xl" : "h-11 w-11 text-lg";
  if (logoUrl) {
    return (
      <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200", box)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="h-[80%] w-[80%] object-contain" />
      </span>
    );
  }
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-navy-950 font-display leading-none text-white", box)}>
      {clubInitials(name)}
    </span>
  );
}

export function clubLogoUrl(logoPath: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return logoPath && base ? `${base}/storage/v1/object/public/club-logos/${logoPath}` : null;
}

function detailLine(need: PlayerNeedWithClub, locale: ClubLocale, copy: OverviewCopy) {
  const parts = [`${copy.from} ${formatDate(need.needed_from_date, locale)}`];
  if (need.need_type === "spieler") {
    if (need.age_min !== null || need.age_max !== null) {
      parts.push(`${need.age_min ?? "–"}–${need.age_max ?? "–"} ${copy.age}`);
    }
    if (need.height_min !== null) parts.push(`${copy.heightMin} ${need.height_min} cm`);
  }
  return parts.join(" · ");
}

export function NeedCard({
  need,
  href,
  locale,
  copy
}: {
  need: PlayerNeedWithClub;
  href: string;
  locale: ClubLocale;
  copy: OverviewCopy;
}) {
  const isCoach = need.need_type === "trainer";
  const labels = needProfileLabels(need, locale);
  const chips = [...labels.playerTypes, ...labels.targetRoles];
  const visibleChips = chips.slice(0, 3);
  const attack = attackPositionsText(need, locale);
  const defense = defensePositionsText(need, locale);
  const stale = isStale(need);
  const missingPosition = !hasNeedPosition(need);

  return (
    <Link
      href={href}
      className="group flex flex-col border border-slate-200 bg-white text-navy-950 transition duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-cardHover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <ClubCrest name={need.clubs.name} logoUrl={clubLogoUrl(need.clubs.logo_path)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.95rem] font-bold">{need.clubs.name}</p>
          <p className="truncate text-xs text-slate-500">
            {need.clubs.league} · {need.clubs.city}
          </p>
        </div>
        <span className={cn("whitespace-nowrap px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.12em]", PRIORITY_TAG[need.priority])}>
          {CLUB_PRIORITY_LABELS[locale][need.priority]}
        </span>
      </div>

      <div className="relative w-full overflow-hidden bg-navy-950" style={{ aspectRatio: COURT_ASPECT.mini }}>
        {isCoach ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span aria-hidden="true" className="absolute font-display text-[7rem] leading-none text-white/[0.07]">
              COACH
            </span>
            <span className="relative font-display text-3xl tracking-[0.02em] text-white">{needHeadline(need, locale)}</span>
          </div>
        ) : (
          <>
            <CourtLines crop="mini" />
            {ATTACK_POSITIONS.map((position) => {
              const on = need.attack_positions.includes(position);
              return (
                <span
                  key={position}
                  aria-hidden="true"
                  className={cn(
                    "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-display leading-none text-white",
                    on
                      ? "h-8 w-8 border-brand-500 bg-brand-500 text-[0.95rem] shadow-[0_0_0_5px_rgba(0,85,255,0.28)]"
                      : "h-2.5 w-2.5 border-white/30"
                  )}
                  style={attackSpot(position, "mini")}
                >
                  {on ? position : null}
                </span>
              );
            })}
            {need.defense_positions.map((position) => (
              <span
                key={`d${position}`}
                aria-hidden="true"
                className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white font-display text-[0.9rem] leading-none text-navy-950 shadow-[0_0_0_3px_rgba(0,85,255,0.6)]"
                style={defenseSpot(position, "mini")}
              >
                {position}
              </span>
            ))}
            {missingPosition ? (
              <span className="absolute inset-x-0 bottom-3 mx-auto w-fit bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                {clubCopy[locale].dashboard.noPosition}
              </span>
            ) : null}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[2rem] leading-[0.9]">{isCoach ? copy.coach : attack || defense || "–"}</p>
            {!isCoach && attack && defense ? <p className="mt-1 text-xs font-semibold text-slate-500">{defense}</p> : null}
          </div>
          <p className="whitespace-nowrap text-xs font-bold tracking-[0.08em] text-brand-700">{need.season}</p>
        </div>
        <p className="text-[0.8rem] leading-5 text-slate-600">{detailLine(need, locale, copy)}</p>
        {visibleChips.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {visibleChips.map((chip) => (
              <span key={chip} className="bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {chip}
              </span>
            ))}
            {chips.length > visibleChips.length ? (
              <span className="px-1 py-1 text-xs font-semibold text-slate-500">+{chips.length - visibleChips.length}</span>
            ) : null}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <span className="inline-flex items-center gap-2 font-bold">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                need.status === "offen" ? "bg-brand-500" : need.status === "in_gespraechen" ? "bg-amber-600" : "bg-slate-400"
              )}
              aria-hidden="true"
            />
            {CLUB_STATUS_LABELS[locale][need.status]}
          </span>
          {stale ? (
            <span className="bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">{copy.stale}</span>
          ) : (
            <span className="text-slate-500">
              {copy.updated} {formatDate(need.updated_at, locale)}
            </span>
          )}
        </div>
      </div>
      <span className="sr-only">{copy.open}</span>
    </Link>
  );
}
