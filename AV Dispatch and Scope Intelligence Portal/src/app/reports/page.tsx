import { ReportsOverview } from "@/components/reports/reports-overview";
import { AppShell } from "@/components/shared/app-shell";

export default function ReportsPage() {
  return (
    <AppShell currentPath="/reports">
      <ReportsOverview />
    </AppShell>
  );
}
