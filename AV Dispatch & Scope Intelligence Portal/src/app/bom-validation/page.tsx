import { AppShell } from "@/components/shared/app-shell";
import { ValidationOverview } from "@/components/validation/validation-overview";

export default function BomValidationPage() {
  return (
    <AppShell currentPath="/bom-validation">
      <ValidationOverview />
    </AppShell>
  );
}
