"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** A value to paste somewhere else (Supabase, DNS), with a copy button. */
export function CopyValue({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-w-0 items-stretch border border-slate-200 bg-slate-50">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap px-3 py-2 font-mono text-[0.8rem] text-navy-950">{value}</code>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        }}
        aria-label={`${label ?? value} kopieren`}
        className="flex min-h-10 w-11 shrink-0 items-center justify-center border-l border-slate-200 text-slate-500 hover:bg-white hover:text-navy-950"
      >
        {copied ? <Check className="h-4 w-4 text-brand-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
