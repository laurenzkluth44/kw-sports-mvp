import { Trash2 } from "lucide-react";
import { removeClubNeedAction } from "@/features/player-needs/actions";
import type { ClubLocale } from "@/lib/club-i18n";
import { clubNeedCopy } from "@/lib/club-need-i18n";
import { cn } from "@/lib/utils";

/**
 * "Löschen" with a confirmation step, without JavaScript dialogs: the first click opens a small panel,
 * the second one deletes. tone "dark" for the dark need header, "light" for the white need cards.
 */
export function NeedRemoveButton({
  needId,
  locale,
  tone = "light",
  className
}: {
  needId: string;
  locale: ClubLocale;
  tone?: "light" | "dark";
  className?: string;
}) {
  const t = clubNeedCopy[locale];
  return (
    <details className={cn("group/remove relative", className)}>
      <summary
        className={cn(
          "inline-flex min-h-10 cursor-pointer list-none items-center gap-1.5 px-3 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] transition-colors [&::-webkit-details-marker]:hidden",
          tone === "dark"
            ? "border border-white/20 text-white hover:border-red-300 hover:text-red-200"
            : "text-slate-500 hover:text-red-700"
        )}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        {t.remove}
      </summary>
      <div className="absolute bottom-full right-0 z-20 mb-2 w-72 max-w-[calc(100vw-2rem)] border border-red-200 bg-white p-4 text-left text-navy-950 shadow-cardHover">
        <p className="text-sm font-bold">{t.removeQuestion}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{t.removeHint}</p>
        <form action={removeClubNeedAction} className="mt-3">
          <input type="hidden" name="id" value={needId} />
          <input type="hidden" name="return_to" value={`/club/needs/${needId}`} />
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-1.5 bg-red-700 px-3 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-white hover:bg-red-800"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {t.removeYes}
          </button>
        </form>
      </div>
    </details>
  );
}
