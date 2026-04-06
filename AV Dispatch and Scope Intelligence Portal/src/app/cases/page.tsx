import { AppShell } from "@/components/shared/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCaseRollups, getServiceCases } from "@/lib/data/repository";

export default function CasesPage() {
  const cases = getServiceCases();
  const rollups = new Map(getCaseRollups().map((item) => [item.caseNumber, item]));

  return (
    <AppShell currentPath="/cases">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Cases"
          title="Case queue and visit history"
          description="Parent-level service issues with repeat-visit context, case signals, and the work-order counts that feed dispatch planning."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {cases.map((item) => (
            <Card key={item.id}>
              <p className="text-sm text-slate-500">{item.caseNumber}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">{item.shortDescription}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {item.client.name} • {item.site.name}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="sky">{item.state}</Badge>
                <Badge tone="slate">{item.priority}</Badge>
                {rollups.get(item.caseNumber)?.hasRepeatDispatch ? (
                  <Badge tone="amber">Repeat Dispatch</Badge>
                ) : null}
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p>Account: {item.accountName}</p>
                <p>Site: {item.site.city}, {item.site.state}</p>
                <p>Work orders: {rollups.get(item.caseNumber)?.totalWorkOrders ?? 0}</p>
              </div>

              <div className="mt-4 space-y-2">
                {(item.caseSignals.length ? item.caseSignals.map((signal) => signal.type) : [item.analysis?.summary ?? "No analysis summary yet."]).map((note) => (
                  <div key={note} className="rounded-2xl bg-sky-50 p-3 text-sm text-sky-950">
                    {note}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
