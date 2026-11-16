"use client";

import { ArrowRight, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { globalSearchAction } from "./actions";
import type { SearchGroup, SearchItem, SearchResult } from "./model";

type Copy = {
  button: string;
  placeholder: string;
  hint: string;
  empty: string;
  typeMore: string;
  close: string;
  groups: Record<SearchGroup, string>;
};

/**
 * Global search in the header. Opens with the button, ⌘K / Ctrl+K or "/".
 * Results come from the server (only what this user may see) and open with Enter or a click.
 */
export function SearchPalette({ copy, variant = "desktop" }: { copy: Copy; variant?: "desktop" | "mobile" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The dialog is rendered into <body>: inside the sticky header, "fixed" would only cover the header.
  useEffect(() => setMounted(true), []);

  const flat = useMemo(() => results.flatMap((group) => group.items), [results]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActive(0);
  }, []);

  // Keyboard shortcuts to open: ⌘K / Ctrl+K anywhere, "/" when not typing in a field.
  // Only the desktop instance listens, so the shortcut doesn't open two palettes.
  useEffect(() => {
    if (variant !== "desktop") return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "/" && !typing && !open) {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function search(next: string) {
    setQuery(next);
    if (timer.current) clearTimeout(timer.current);
    if (next.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(() => {
      const id = ++request.current;
      startTransition(async () => {
        const found = await globalSearchAction(next);
        // Ignore answers to older keystrokes that arrive late.
        if (id === request.current) {
          setResults(found);
          setActive(0);
        }
      });
    }, 150);
  }

  function go(item: SearchItem | undefined) {
    if (!item) return;
    close();
    router.push(item.href);
  }

  function onInputKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(flat.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(flat[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  let index = -1;

  return (
    <>
      {variant === "desktop" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group inline-flex min-h-10 w-48 items-center gap-2 border border-white/20 bg-white/[0.06] px-3 text-left text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white 2xl:w-64"
        >
          <Search className="h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
          <span className="flex-1 truncate">{copy.button} …</span>
          <kbd className="border border-white/20 px-1.5 font-sans text-[0.65rem] font-bold tracking-wider text-white/60">⌘K</kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={copy.button}
          className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-white hover:border-white/40"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {open && mounted ? createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-navy-950/60 px-3 pt-[10vh] backdrop-blur-[2px] sm:px-6" onMouseDown={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={copy.button}
            onMouseDown={(event) => event.stopPropagation()}
            className="flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden border-t-[3px] border-brand-500 bg-white text-navy-950 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4">
              <Search className={cn("h-5 w-5 shrink-0", pending ? "animate-pulse text-brand-500" : "text-slate-400")} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => search(event.target.value)}
                onKeyDown={onInputKey}
                placeholder={copy.placeholder}
                aria-label={copy.placeholder}
                aria-controls="global-search-results"
                aria-activedescendant={flat.length ? `search-item-${active}` : undefined}
                autoComplete="off"
                spellCheck={false}
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400 sm:text-lg"
              />
              <button type="button" onClick={close} aria-label={copy.close} className="p-1.5 text-slate-400 hover:text-navy-950">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div ref={listRef} id="global-search-results" role="listbox" className="min-h-0 flex-1 overflow-y-auto py-2">
              {query.trim().length < 2 ? (
                <p className="px-5 py-6 text-sm text-slate-500">{copy.typeMore}</p>
              ) : results.length === 0 && !pending ? (
                <p className="px-5 py-6 text-sm text-slate-500">{copy.empty}</p>
              ) : (
                results.map((group) => (
                  <div key={group.group} className="pb-1">
                    <p className="px-5 pb-1 pt-3 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-slate-400">{copy.groups[group.group]}</p>
                    {group.items.map((item) => {
                      index += 1;
                      const current = index;
                      const selected = current === active;
                      return (
                        <button
                          key={`${item.href}-${item.title}`}
                          id={`search-item-${current}`}
                          data-index={current}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onMouseMove={() => setActive(current)}
                          onClick={() => go(item)}
                          className={cn(
                            "flex w-full items-center gap-3 border-l-2 px-5 py-2.5 text-left",
                            selected ? "border-brand-500 bg-brand-50" : "border-transparent"
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold">{item.title}</span>
                            {item.subtitle ? <span className="block truncate text-xs text-slate-500">{item.subtitle}</span> : null}
                          </span>
                          <ArrowRight className={cn("h-4 w-4 shrink-0", selected ? "text-brand-500" : "text-transparent")} aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <p className="hidden border-t border-slate-100 bg-slate-50 px-5 py-2 text-[0.7rem] font-semibold text-slate-500 sm:block">{copy.hint}</p>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
