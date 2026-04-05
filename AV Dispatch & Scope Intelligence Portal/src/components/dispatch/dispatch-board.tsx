import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDispatches, getTechniciansForDispatch } from "@/lib/data/repository";
import { formatPercent, formatVisitDate } from "@/lib/utils";

export function DispatchBoard() {
  const dispatches = getDispatches();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Dispatch Board"
        title="Upcoming onsite work"
        description="A first-pass board view for daily and weekly dispatch management with risk indicators, staffing context, and scope readiness."
      />

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.1fr_0.9fr_0.8fr_0.7fr_0.7fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          <span>Visit</span>
          <span>Client / Site</span>
          <span>Staffing</span>
          <span>Status</span>
          <span>Validation</span>
          <span>Signals</span>
        </div>

        {dispatches.map((dispatch) => {
          const technicians = getTechniciansForDispatch(dispatch.assignedTechIds);
          return (
            <div
              key={dispatch.id}
              className="grid grid-cols-[1.1fr_0.9fr_0.8fr_0.7fr_0.7fr_1fr] gap-4 border-b border-slate-100 px-6 py-5 text-sm last:border-b-0"
            >
              <div>
                <p className="font-semibold text-slate-950">{dispatch.projectName}</p>
                <p className="mt-1 text-slate-500">{dispatch.caseNumber}</p>
                <p className="mt-2 text-slate-700">{formatVisitDate(dispatch.visitDate)}</p>
              </div>

              <div>
                <p className="font-medium text-slate-900">{dispatch.client.name}</p>
                <p className="mt-1 text-slate-600">
                  {dispatch.site.city}, {dispatch.site.state}
                </p>
                <p className="mt-2 text-slate-500">{dispatch.visitPurpose}</p>
              </div>

              <div>
                <p className="text-slate-900">{technicians.map((tech) => tech.name).join(", ")}</p>
                <p className="mt-1 text-slate-500">{dispatch.supervisor}</p>
                <p className="mt-2 text-slate-500">{dispatch.laborSource}</p>
              </div>

              <div className="space-y-2">
                <Badge tone={dispatch.status === "At Risk" ? "red" : dispatch.status === "Needs Scope" ? "amber" : "green"}>
                  {dispatch.status}
                </Badge>
                <div>
                  <Badge tone={dispatch.urgency === "High" ? "red" : "slate"}>{dispatch.urgency}</Badge>
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-900">{dispatch.validation.verdict}</p>
                <p className="mt-1 text-slate-500">
                  {formatPercent(dispatch.validation.confidence)} confidence
                </p>
              </div>

              <div className="space-y-2 text-slate-600">
                <p>Weather: {dispatch.weather.severeRisk}</p>
                <p>Traffic: {dispatch.traffic.routeRisk}</p>
                <p>Blockers: {dispatch.blockers.length}</p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
