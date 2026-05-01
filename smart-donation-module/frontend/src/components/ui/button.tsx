import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "ghost" | "danger";
type Size = "default" | "sm" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/60 disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  default:
    "bg-gradient-to-r from-brand-green to-brand-orange text-white shadow hover:brightness-110",
  secondary: "bg-zinc-900 text-white hover:bg-zinc-800",
  ghost: "bg-transparent hover:bg-zinc-100 text-zinc-900",
  danger: "bg-red-600 text-white hover:bg-red-500"
};

const sizes: Record<Size, string> = {
  default: "h-11 px-4",
  sm: "h-9 px-3 rounded-lg",
  lg: "h-12 px-6 text-base"
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

