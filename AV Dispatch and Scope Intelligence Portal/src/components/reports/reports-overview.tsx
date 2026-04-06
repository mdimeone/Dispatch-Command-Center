import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getReportsSnapshot } from "@/lib/data/repository";

export function ReportsOverview() {
  const reports = getReportsSnapshot();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Reports"
        title="Prototype reporting snapshots"
        description="A simple reporting surface that can later become charts, saved views, and export workflows."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-xl font-semibold text-slate-950">Scope Drafting Trend</h3>
          <div className="mt-6 space-y-3">
            {reports.scopeDraftingTrend.map((point) => (
              <div key={point.week}>
                <div className="mb-1 flex justify-between text-sm text-slate-600">
                  <span>{point.week}</span>
                  <span>{point.scopes} scopes</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-sky-500"
                    style={{ width: `${(point.scopes / 22) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-slate-950">Supervisor Load</h3>
          <div className="mt-6 space-y-3">
            {reports.supervisorLoad.map((row) => (
              <div key={row.supervisor} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between gap-4">
                  <span className="font-medium text-slate-900">{row.supervisor}</span>
                  <span className="text-sm text-slate-600">{row.active} active cases</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
