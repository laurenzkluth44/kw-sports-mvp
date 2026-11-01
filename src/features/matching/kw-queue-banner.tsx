import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * KW admin work queue: needs where consented KW players fit but nothing was sent yet.
 * Toggles the overview between all needs and just those.
 */
export function KwQueueBanner({ count, active, filtersQuery }: { count: number; active: boolean; filtersQuery: string }) {
  const base = filtersQuery ? `/admin?${filtersQuery}` : "/admin";
  const toggle = active ? base : `${base}${filtersQuery ? "&" : "?"}kw=offen`;

  if (count === 0 && !active) return null;

  return (
    <section
      className={cn(
        "flex flex-col gap-3 border-l-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        active ? "border-navy-950 bg-navy-950 text-white" : "border-brand-500 bg-brand-50 text-navy-950"
      )}
    >
      <div className="flex items-start gap-3">
        <Sparkles className={cn("mt-0.5 h-5 w-5 shrink-0", active ? "text-brand-300" : "text-brand-500")} aria-hidden="true" />
        <div>
          <p className="font-bold">
            {count === 1 ? "1 Bedarf" : `${count} Bedarfe`} mit passenden KW-Spielern, noch ohne Vorschlag
          </p>
          <p className={cn("mt-0.5 text-sm", active ? "text-white/70" : "text-slate-600")}>
            {active
              ? "Es werden nur diese Bedarfe angezeigt. Öffne einen Bedarf und gib den passenden Spieler für den Verein frei."
              : "Hier kannst du sofort einen Spieler platzieren. Zahl auf der Karte = passende, freigegebene KW-Spieler."}
          </p>
        </div>
      </div>
      <Link
        href={toggle}
        className={cn(
          "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 px-4 text-[0.8rem] font-bold uppercase tracking-[0.08em] transition-colors",
          active ? "border border-white/25 text-white hover:bg-white/10" : "bg-brand-500 text-white hover:bg-blue-bright"
        )}
      >
        {active ? (
          <>
            <X className="h-4 w-4" aria-hidden="true" />
            Alle Bedarfe zeigen
          </>
        ) : (
          <>
            Nur diese zeigen
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Link>
    </section>
  );
}
