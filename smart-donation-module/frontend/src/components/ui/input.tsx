import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-white/40 bg-white/70 px-4 text-sm outline-none backdrop-blur placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-green/60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

