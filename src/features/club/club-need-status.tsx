import { Check, ChevronDown } from "lucide-react";
import { updateClubNeedStatusAction } from "@/features/player-needs/actions";
import { CLUB_STATUS_LABELS, type ClubLocale } from "@/lib/club-i18n";
import { clubNeedCopy } from "@/lib/club-need-i18n";
import { STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { NeedFillSource, PlayerNeed, PlayerNeedStatus } from "@/types/domain";

const DOT: Record<PlayerNeedStatus, string> = {
  offen: "bg-brand-500",
  in_gespraechen: "bg-amber-500",
  besetzt: "bg-slate-700",
  archiviert: "bg-slate-300"
};

const SOURCES: NeedFillSource[] = ["kw_sports", "andere_agentur", "eigene_suche", "intern"];

const tileClass = (active: boolean) =>
  cn(
    "flex min-h-16 w-full flex-col items-start justify-center gap-1 border px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
    active ? "border-navy-950 bg-navy-950 text-white" : "border-slate-200 bg-white text-navy-950 hover:border-brand-300 hover:bg-brand-50"
  );

/**
 * Status as four big, self-explaining choices instead of a dropdown + save button. One click saves.
 * "Besetzt" first asks how the position was filled (private to the club and KW Sports).
 */
export function ClubNeedStatus({
  need,
  locale,
  returnTo,
  filledVia
}: {
  need: PlayerNeed;
  locale: ClubLocale;
  returnTo: string;
  filledVia?: NeedFillSource | null;
}) {
  const t = clubNeedCopy[locale];
  const hidden = (
    <>
      <input type="hidden" name="id" value={need.id} />
      <input type="hidden" name="return_to" value={returnTo} />
    </>
  );

  const label = (status: PlayerNeedStatus, active: boolean, help: string) => (
    <>
      <span className="inline-flex items-center gap-2 text-sm font-extrabold">
        <span aria-hidden="true" className={cn("h-2.5 w-2.5 rounded-full", DOT[status], active && "ring-2 ring-white/80")} />
        {CLUB_STATUS_LABELS[locale][status]}
      </span>
      <span className={cn("text-xs leading-4", active ? "text-white/70" : "text-slate-500")}>{help}</span>
    </>
  );

  return (
    <section className="panel p-5">
      <h2 className="section-heading">{t.statusTitle}</h2>
      <p className="mt-1 text-sm text-slate-600">{t.statusHint}</p>
      <div role="group" aria-label={t.statusTitle} className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {STATUSES.map((status) => {
          const active = need.status === status;

          if (status === "besetzt") {
            const help = active && filledVia ? t.filledVia[filledVia] : t.statusHelp.besetzt;
            return (
              <details key={status} className="group relative">
                <summary className={cn(tileClass(active), "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}>
                  <span className="flex w-full items-start justify-between gap-2">
                    <span className="flex flex-col gap-1">{label(status, active, help)}</span>
                    <ChevronDown
                      className={cn("mt-0.5 h-4 w-4 shrink-0 transition-transform group-open:rotate-180", active ? "text-white/60" : "text-slate-400")}
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <form
                  action={updateClubNeedStatusAction}
                  className="absolute left-0 top-full z-20 mt-1 w-[min(18rem,80vw)] border border-navy-950 bg-white p-3 shadow-cardHover"
                >
                  {hidden}
                  <input type="hidden" name="status" value="besetzt" />
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-navy-950">{t.filledQuestion}</p>
                  <div className="flex flex-col gap-1">
                    {SOURCES.map((source) => {
                      const chosen = active && filledVia === source;
                      return (
                        <button
                          key={source}
                          type="submit"
                          name="filled_via"
                          value={source}
                          className={cn(
                            "flex min-h-10 items-center justify-between gap-2 px-3 text-left text-sm font-semibold transition-colors",
                            chosen ? "bg-navy-950 text-white" : source === "kw_sports" ? "bg-brand-50 text-brand-800 hover:bg-brand-100" : "hover:bg-slate-100"
                          )}
                        >
                          {t.filledVia[source]}
                          {chosen ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </form>
              </details>
            );
          }

          return (
            <form key={status} action={updateClubNeedStatusAction}>
              {hidden}
              <button
                type="submit"
                name="status"
                value={status}
                aria-pressed={active}
                disabled={active}
                className={cn(tileClass(active), active && "cursor-default")}
              >
                {label(status, active, t.statusHelp[status])}
              </button>
            </form>
          );
        })}
      </div>
    </section>
  );
}
