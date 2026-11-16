import type { Completeness } from "@/features/kw-players/completeness";
import { cn } from "@/lib/utils";

/** Share of filled profile fields; the missing ones show on hover and on the edit page. */
export function CompletenessMeter({ completeness }: { completeness: Completeness }) {
  const { percent, missing } = completeness;
  return (
    <span
      title={missing.length ? `Fehlt: ${missing.join(", ")}` : "Profil vollständig"}
      className="flex w-full items-center gap-2 pt-1 normal-case tracking-normal"
    >
      <span className="h-1.5 flex-1 bg-white/10" aria-hidden="true">
        <span
          className={cn("block h-full", percent === 100 ? "bg-brand-500" : percent >= 70 ? "bg-white/70" : "bg-amber-400")}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className={cn("text-[0.7rem] font-bold", percent === 100 ? "text-brand-300" : percent >= 70 ? "text-white/80" : "text-amber-200")}>
        Profil {percent} %
      </span>
    </span>
  );
}
