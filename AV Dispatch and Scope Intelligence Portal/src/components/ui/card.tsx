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
        "brand-outline rounded-3xl border bg-white/90 p-6 shadow-glow backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
