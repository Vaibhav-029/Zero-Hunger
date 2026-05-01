import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full rounded-full bg-zinc-200", className)}>
      <div
        className="h-2 rounded-full bg-gradient-to-r from-brand-green to-brand-orange"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

