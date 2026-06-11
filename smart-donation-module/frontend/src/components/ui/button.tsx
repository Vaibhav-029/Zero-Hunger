import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "ghost" | "danger";
type Size = "default" | "sm" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  default:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800",
  secondary: "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800",
  ghost: "bg-transparent hover:bg-zinc-100 text-zinc-700",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700"
};

const sizes: Record<Size, string> = {
  default: "h-10 px-4",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-5"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
