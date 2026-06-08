import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const baseClasses =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-navy-700 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-55";

const variants = {
  primary: "bg-navy-900 text-white hover:bg-navy-800",
  secondary: "border border-neutral-300 bg-white text-navy-950 hover:bg-neutral-50",
  accent: "bg-[#0b55e8] text-white shadow-sm shadow-[#0b55e8]/30 hover:bg-[#074bd3]",
  ghost: "text-neutral-700 hover:bg-white/10 hover:text-white"
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
