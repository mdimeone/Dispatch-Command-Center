import { AlertTriangle, CloudRain, Route, Sparkles } from "lucide-react";
import { KpiCard } from "@/components/shared/kpi-card";
import { QueueCard } from "@/components/shared/queue-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatPercent, formatVisitDate } from "@/lib/utils";
import { getDashboardSnapshot, getTechniciansForDispatch } from "@/lib/data/repository";

export function DashboardOverview() {
  const snapshot = getDashboardSnapshot();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-700">
            Operational Command Center
          </p>
          <h2 className="mt-1 font-display text-[2.3rem] leading-tight text-slate-950">
            Dispatch planning with scope intelligence built in
          </h2>
        </div>
        <Badge tone="sky">Prototype Control Surface</Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.metrics.map((metric) => (
          <KpiCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-6">
          <SectionHeading
            eyebrow="Priority Board"
            title="Dispatches demanding action"
            description="A cross-functional shortlist that blends urgency, validation risk, and travel exposure."
          />

          <div className="space-y-4">
            {snapshot.featuredDispatches.map((dispatch) => {
              const assigned = getTechniciansForDispatch(dispatch.assignedTechIds);
              return (
                <div
                  key={dispatch.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={dispatch.urgency === "High" ? "red" : "amber"}>
                      {dispatch.urgency} urgency
                    </Badge>
                    <Badge tone="slate">{dispatch.status}</Badge>
                    <Badge tone="sky">{dispatch.caseNumber}</Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-950">{dispatch.projectName}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {dispatch.client.name} • {dispatch.site.city}, {dispatch.site.state}
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p>{formatVisitDate(dispatch.visitDate)}</p>
                      <p>{assigned.map((tech) => tech.name).join(", ")}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-700">{dispatch.visitPurpose}</p>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CloudRain className="h-4 w-4" />
                        Weather
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-950">
                        {dispatch.weather.summary}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Route className="h-4 w-4" />
                        Traffic
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-950">
                        {dispatch.traffic.etaMinutes} min ETA • leave by {dispatch.traffic.leaveBy}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Sparkles className="h-4 w-4" />
                        Validation
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-950">
                        {dispatch.validation.verdict} • {formatPercent(dispatch.validation.confidence)}
                      </p>
                    </div>
                  </div>

                  {dispatch.blockers.length ? (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{dispatch.blockers.join(" • ")}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          {snapshot.queues.map((item) => (
            <QueueCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
