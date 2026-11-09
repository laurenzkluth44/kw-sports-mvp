"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

/** Name search for the player database: filters while typing (the list is filtered on the server via ?q=). */
export function PlayerSearch({ count }: { count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply(next: string) {
    const query = new URLSearchParams(params.toString());
    if (next.trim()) query.set("q", next.trim());
    else query.delete("q");
    query.delete("done");
    const text = query.toString();
    startTransition(() => router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false }));
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        autoComplete="off"
        placeholder="Spieler suchen: Name oder Verein"
        aria-label="Spieler suchen"
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => apply(next), 200);
        }}
        className={cn(
          "h-12 w-full border border-slate-300 bg-white pl-10 pr-24 text-base text-navy-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 [&::-webkit-search-cancel-button]:hidden",
          pending && "opacity-80"
        )}
      />
      <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs font-semibold text-slate-500">
        {value ? (
          <>
            {count} Treffer
            <button
              type="button"
              aria-label="Suche leeren"
              onClick={() => {
                setValue("");
                apply("");
              }}
              className="p-1 text-slate-400 hover:text-navy-950"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </span>
    </div>
  );
}
