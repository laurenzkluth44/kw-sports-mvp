import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const baseClasses =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-sm px-4 py-2 text-[0.8rem] font-bold uppercase tracking-[0.08em] transition-all duration-300 ease-out-expo focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-out-expo hover:[&>svg:last-child]:translate-x-0.5";

const variants = {
  primary: "border border-navy-950 bg-navy-950 text-white shadow-sm hover:bg-navy-800",
  secondary: "border border-slate-200 bg-white text-navy-950 shadow-sm hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50",
  accent: "border border-brand-500 bg-brand-500 text-white shadow-blueGlow hover:bg-blue-bright hover:border-blue-bright",
  ghost: "border border-transparent text-neutral-700 hover:bg-white/10 hover:text-white"
} as const;

type Variant = keyof typeof variants;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(baseClasses, variants[variant], className)} {...props} />;
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: Variant;
};

export function LinkButton({ className, variant = "primary", href, children, ...props }: LinkButtonProps) {
  return (
    <Link href={href} className={cn(baseClasses, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
