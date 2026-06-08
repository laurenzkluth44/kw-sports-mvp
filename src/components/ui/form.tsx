import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("field-label", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-navy-700 focus:ring-2 focus:ring-navy-100",
        "border-neutral-300 text-navy-950 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-brand-100",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-100",
        "border-neutral-300 text-navy-950 focus:border-brand-500 focus:ring-brand-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-navy-700 focus:ring-2 focus:ring-navy-100",
        "border-neutral-300 text-navy-950 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-brand-100",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  help,
  children,
  className
}: {
  label: string;
  htmlFor: string;
  help?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {help ? <p className="field-help">{help}</p> : null}
    </div>
  );
}
