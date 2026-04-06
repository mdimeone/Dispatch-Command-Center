import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppShell } from "@/components/shared/app-shell";

export default function DashboardPage() {
  return (
    <AppShell currentPath="/dashboard">
      <DashboardOverview />
    </AppShell>
  );
}
