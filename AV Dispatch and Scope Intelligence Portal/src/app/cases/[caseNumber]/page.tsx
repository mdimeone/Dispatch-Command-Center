import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  getCaseRollups,
  getServiceCaseByNumber,
  getWorkOrders
} from "@/lib/data/repository";

export default async function CaseDetailPage({
  params
}: {
  params: Promise<{ caseNumber: string }>;
}) {
  const { caseNumber } = await params;
  const serviceCase = getServiceCaseByNumber(caseNumber);

  if (!serviceCase) {
    notFound();
  }

  const workOrders = getWorkOrders().filter((workOrder) => workOrder.caseNumber === caseNumber);
  const rollup = getCaseRollups().find((item) => item.caseNumber === caseNumber);

  return (
    <AppShell currentPath="/cases">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Case Detail"
          title={`${serviceCase.caseNumber} • ${serviceCase.shortDescription}`}
          description={`${serviceCase.client.name} • ${serviceCase.site.name} (${serviceCase.site.city}, ${serviceCase.site.state})`}
        />

        <Card className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="sky">{serviceCase.state}</Badge>
            <Badge tone="slate">{serviceCase.priority}</Badge>
            {rollup?.hasRepeatDispatch ? <Badge tone="amber">Repeat Dispatch</Badge> : null}
          </div>

          <div className="grid gap-3 text-sm text-slate-700 lg:grid-cols-4">
            <p>Open WOs: {rollup?.openWorkOrders ?? 0}</p>
            <p>Completed WOs: {rollup?.completedWorkOrders ?? 0}</p>
            <p>Repeat visits: {rollup?.repeatVisitCount ?? 0}</p>
            <p>Latest WO: {rollup?.latestWorkOrderNumber ?? "N/A"}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <p>Account: {serviceCase.accountName}</p>
            <p>Assignment Group: {serviceCase.assignmentGroup ?? "Unassigned"}</p>
            <p>Contact: {serviceCase.primaryContact?.name ?? "No contact listed"}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/cases"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to cases
            </Link>
            <Link
              href="/dispatch-board"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Dispatch board
            </Link>
            <Link
              href="/scope-review"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Scope review
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Case Signals</p>
            <div className="mt-3 space-y-2">
              {(serviceCase.caseSignals.length
                ? serviceCase.caseSignals.map(
                    (signal) =>
                      `${signal.type} (${signal.severity})${
                        signal.recommendation?.nextStep ? `: ${signal.recommendation.nextStep}` : ""
                      }`
                  )
                : [serviceCase.analysis?.summary ?? "No signal analysis available."]).map((note) => (
                <div key={note} className="rounded-2xl bg-sky-50 p-3 text-sm text-sky-950">
                  {note}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Work Orders</p>
            <div className="mt-3 space-y-2">
              {workOrders.length ? (
                workOrders.map((workOrder) => (
                  <div key={workOrder.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{workOrder.workOrderNumber}</p>
                    <p className="mt-1">
                      {workOrder.state} • {workOrder.assignedTo ?? "Unassigned"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Scheduled: {workOrder.scheduledStart ?? "No date"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  No related work orders found.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
