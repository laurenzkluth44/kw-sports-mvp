import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.08em]",
        className
      )}
    >
      {children}
    </span>
  );
}
