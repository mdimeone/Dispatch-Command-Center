import { AppShell } from "@/components/shared/app-shell";
import { CasesBoard } from "@/components/cases/cases-board";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCaseRollups, getServiceCases } from "@/lib/data/repository";

export default function CasesPage() {
  const cases = getServiceCases();
  const rollups = getCaseRollups();

  return (
    <AppShell currentPath="/cases">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Cases"
          title="Case queue and visit history"
          description="Parent-level service issues with repeat-visit context, case signals, and the work-order counts that feed dispatch planning."
        />
        <CasesBoard cases={cases} rollups={rollups} />
      </div>
    </AppShell>
  );
}
