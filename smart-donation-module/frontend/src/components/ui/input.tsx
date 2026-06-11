import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
