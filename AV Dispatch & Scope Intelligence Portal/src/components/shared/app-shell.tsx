import type { ReactNode } from "react";
import Link from "next/link";
import { AppWindow, ClipboardList, FolderKanban, Gauge, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fbff,_#eef3f8)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-glow">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-200">One Diversified</p>
            <h1 className="mt-3 font-display text-3xl leading-tight">
              AV Dispatch
              <br />
              Scope Portal
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Dispatch visibility, scope intelligence, and review-ready operational workflows.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = currentPath === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    active ? "bg-sky-400 text-slate-950" : "text-slate-200 hover:bg-white/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Prototype Mode</p>
            <p className="mt-2 text-sm text-slate-300">
              Sample data is active. Excel and enterprise connectors can plug into the same service layer.
            </p>
          </div>
        </aside>

        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}
