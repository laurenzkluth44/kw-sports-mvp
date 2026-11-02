"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: ReactNode; badge?: number };

/** The item whose href is the longest prefix of the current path is the active one. */
export function activeHref(pathname: string, items: NavItem[]) {
  return items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function NavLinks({
  items,
  variant = "bar",
  className
}: {
  items: NavItem[];
  variant?: "bar" | "menu";
  className?: string;
}) {
  const pathname = usePathname();
  const active = activeHref(pathname, items);

  // Inside the mobile menu (<details>), close the menu once a link is chosen.
  function closeMenu(event: MouseEvent<HTMLAnchorElement>) {
    event.currentTarget.closest("details")?.removeAttribute("open");
  }

  return (
    <nav aria-label="Hauptnavigation" className={className}>
      <ul className={variant === "bar" ? "-mb-px flex gap-6 overflow-x-auto" : "flex flex-col"}>
        {items.map((item) => {
          const isActive = item.href === active;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                aria-current={isActive ? "page" : undefined}
                data-active={isActive ? "true" : undefined}
                onClick={variant === "menu" ? closeMenu : undefined}
                className={cn(
                  variant === "bar"
                    ? "nav-link"
                    : "flex min-h-12 items-center gap-3 border-l-[3px] px-4 text-sm font-bold uppercase tracking-[0.08em]",
                  variant === "menu" && (isActive ? "border-brand-500 bg-white/5 text-white" : "border-transparent text-white/70 hover:text-white")
                )}
              >
                {item.icon}
                {item.label}
                {item.badge ? (
                  <span className="ml-0.5 inline-flex min-w-5 items-center justify-center bg-brand-500 px-1.5 py-0.5 text-[0.7rem] font-extrabold leading-none text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
