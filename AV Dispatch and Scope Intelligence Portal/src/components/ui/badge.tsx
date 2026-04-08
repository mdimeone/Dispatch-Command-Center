import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const toneClasses = {
  slate: "bg-[var(--brand-blue-50)] text-[var(--brand-blue-900)]",
  sky: "brand-chip",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-rose-100 text-rose-700"
};

interface BadgeProps {
  children: ReactNode;
  tone?: keyof typeof toneClasses;
}

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
