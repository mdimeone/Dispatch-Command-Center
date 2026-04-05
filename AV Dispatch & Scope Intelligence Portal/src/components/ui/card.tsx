import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/60 bg-white/85 p-6 shadow-glow backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
