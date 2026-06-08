import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const baseClasses =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-55";

const variants = {
  primary: "border border-navy-950 bg-navy-950 text-white shadow-sm hover:bg-navy-800",
  secondary: "border border-slate-200 bg-white text-navy-950 shadow-sm hover:border-brand-100 hover:bg-brand-50",
  accent: "border border-[#0b55e8] bg-[#0b55e8] text-white shadow-sm shadow-[#0b55e8]/25 hover:bg-[#074bd3]",
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
