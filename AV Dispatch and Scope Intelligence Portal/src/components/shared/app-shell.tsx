import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { AppWindow, ClipboardList, FolderKanban, Gauge, LogOut, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string; icon: typeof Gauge }> = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/dispatch-board", label: "Dispatch Board", icon: AppWindow },
  { href: "/cases", label: "Cases", icon: ClipboardList },
  { href: "/scope-builder", label: "Scope Builder", icon: FolderKanban },
  { href: "/scope-review", label: "Scope Review", icon: ShieldCheck },
  { href: "/bom-validation", label: "BOM Validation", icon: ShieldCheck },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/reports", label: "Reports", icon: Gauge },
  { href: "/admin", label: "Admin", icon: Settings }
];

export function AppShell({
  children,
  currentPath
}: {
  children: ReactNode;
  currentPath: string;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-none gap-4 px-3 py-3 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-5 lg:px-4 lg:py-4">
        <aside className="brand-sidebar rounded-[2rem] border border-white/35 px-4 py-5 text-white shadow-glow">
          <div className="mb-6">
            <h1 className="font-display text-[2.25rem] leading-tight">
              AV Dispatch
              <br />
              Scope Portal
            </h1>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = currentPath === href;
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm transition",
                    active ? "brand-sidebar-active" : "text-blue-100 hover:bg-white/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Local Path Mode</p>
            <p className="mt-2 text-sm text-blue-50/85">
              The app can read a real local workbook path now, with sample fallback while Excel ingestion is being validated.
            </p>
          </div>

          <Link
            href={"/logout" as Route}
            prefetch={false}
            className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-blue-100 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Link>
        </aside>

        <main className="min-w-0 pb-4">{children}</main>
      </div>
    </div>
  );
}
