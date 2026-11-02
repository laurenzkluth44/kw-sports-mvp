import { updateClubNeedStatusAction } from "@/features/player-needs/actions";
import { CLUB_STATUS_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { clubNeedCopy } from "@/lib/club-need-i18n";
import { STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PlayerNeed, PlayerNeedStatus } from "@/types/domain";

const DOT: Record<PlayerNeedStatus, string> = {
  offen: "bg-brand-500",
  in_gespraechen: "bg-amber-500",
  besetzt: "bg-slate-700",
  archiviert: "bg-slate-300"
};

/** Status as four big, self-explaining choices instead of a dropdown + save button. One click saves. */
export function ClubNeedStatus({ need, locale, returnTo }: { need: PlayerNeed; locale: ClubLocale; returnTo: string }) {
  const t = clubNeedCopy[locale];

  return (
    <form action={updateClubNeedStatusAction} className="panel p-5">
      <input type="hidden" name="id" value={need.id} />
      <input type="hidden" name="return_to" value={returnTo} />
      <h2 className="section-heading">{t.statusTitle}</h2>
      <p className="mt-1 text-sm text-slate-600">{t.statusHint}</p>
      <div role="group" aria-label={t.statusTitle} className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {STATUSES.map((status) => {
          const active = need.status === status;
          return (
            <button
              key={status}
              type="submit"
              name="status"
              value={status}
              aria-pressed={active}
              disabled={active}
              className={cn(
                "flex min-h-16 flex-col items-start justify-center gap-1 border px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                active
                  ? "cursor-default border-navy-950 bg-navy-950 text-white"
                  : "border-slate-200 bg-white text-navy-950 hover:border-brand-300 hover:bg-brand-50"
              )}
            >
              <span className="inline-flex items-center gap-2 text-sm font-extrabold">
                <span aria-hidden="true" className={cn("h-2.5 w-2.5 rounded-full", DOT[status], active && "ring-2 ring-white/80")} />
                {CLUB_STATUS_LABELS[locale][status]}
              </span>
              <span className={cn("text-xs leading-4", active ? "text-white/70" : "text-slate-500")}>{t.statusHelp[status]}</span>
            </button>
          );
        })}
      </div>
    </form>
  );
}
