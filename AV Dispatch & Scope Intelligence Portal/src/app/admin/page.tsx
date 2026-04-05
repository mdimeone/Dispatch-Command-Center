import { AdminOverview } from "@/components/admin/admin-overview";
import { AppShell } from "@/components/shared/app-shell";

export default function AdminPage() {
  return (
    <AppShell currentPath="/admin">
      <AdminOverview />
    </AppShell>
  );
}
