"use client";

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50",
  secondary: "bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50",
  outline:
    "border-2 border-emerald-600 text-emerald-800 bg-white hover:bg-emerald-50 disabled:opacity-50",
  ghost: "text-emerald-800 hover:bg-emerald-50 disabled:opacity-50",
};

export function Button({
  className,
  variant = "primary",
  leftIcon,
  rightIcon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-md transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
