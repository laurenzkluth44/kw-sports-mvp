import { CheckCircle2 } from "lucide-react";

/** Confirmation after a save, shown at the top of the page the user lands on. */
export function Flash({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div role="status" className="alert-success flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export type FlashKind = "created" | "updated" | "status" | "confirmed";

export function flashKind(value: string | undefined): FlashKind | null {
  return value === "created" || value === "updated" || value === "status" || value === "confirmed" ? value : null;
}
