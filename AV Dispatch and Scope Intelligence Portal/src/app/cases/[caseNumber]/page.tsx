import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  CaseOperationalPanel,
  DecisionPanelItem,
  TimelinePanelItem,
  UrgencyPanelItem
} from "@/components/cases/case-operational-panel";
import { getCaseRollups, getServiceCaseByNumber, getWorkOrders } from "@/lib/data/repository";
import { ServiceCase, SignalSeverity, WorkOrder } from "@/types/domain";

interface TimelineEvent {
  id: string;
  at?: string;
  title: string;
  detail: string;
  source: "Case" | "Work Order";
}

interface UrgencyItem {
  id: string;
  severity: SignalSeverity;
  label: string;
  source: string;
  nextStep: string;
}

interface CaseNoteEntry {
  id: string;
  at?: string;
  text: string;
}

type CaseNarrativeEvent =
  | { id: string; type: "case-note"; at?: string; note: CaseNoteEntry }
  | { id: string; type: "work-order"; at?: string; workOrder: WorkOrder };

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

  const healthScore = calculateHealthScore(serviceCase, workOrders);
  const primaryAction = getPrimaryAction(serviceCase, workOrders);
  const actionOwner =
    serviceCase.analysis?.ownerSuggestion ??
    serviceCase.caseSignals.find((signal) => signal.recommendation?.owner)?.recommendation?.owner ??
    serviceCase.assignmentGroup ??
    "Case Manager";
  const openQuestions = deriveOpenQuestions(serviceCase, workOrders);
  const urgencyItems = buildUrgencyItems(serviceCase, workOrders);
  const timeline = buildTimeline(serviceCase, workOrders);
  const readiness = deriveDispatchReadiness(serviceCase, urgencyItems);
  const decisionItems = buildDecisionItems(serviceCase, readiness);
  const chronologicalWorkOrders = sortWorkOrdersChronological(workOrders);
  const readableCaseNotes = extractCaseNoteEntries(serviceCase.commentsAndWorkNotesRaw);
  const narrativeEvents = buildCaseNarrativeEvents(readableCaseNotes, chronologicalWorkOrders);
  const scopeBuilderHref = buildScopeBuilderHref(serviceCase);

  return (
    <AppShell currentPath="/cases">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Case Detail"
          title={`${serviceCase.caseNumber} - ${serviceCase.shortDescription}`}
          description={`${serviceCase.client.name} - ${serviceCase.site.name} (${serviceCase.site.city}, ${serviceCase.site.state})`}
        />

        <Card className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Command Summary</p>

          <div className="flex flex-wrap gap-2">
            <Badge tone="sky">{serviceCase.state}</Badge>
            <Badge tone="slate">{serviceCase.priority}</Badge>
            {rollup?.hasRepeatDispatch ? <Badge tone="amber">Repeat Dispatch</Badge> : null}
            <Badge tone={healthScore >= 80 ? "green" : healthScore >= 60 ? "amber" : "red"}>
              Health {healthScore}/100
            </Badge>
            <Badge tone={readiness.tone}>{readiness.label}</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Action Now" value={primaryAction} />
            <MetricCard label="Owner" value={actionOwner} />
            <MetricCard label="Next Due Trigger" value={toYesNo(hasDueDateTrigger(serviceCase, workOrders))} />
            <MetricCard label="Open Questions" value={String(openQuestions.length)} />
            <MetricCard label="Open Work Orders" value={String(rollup?.openWorkOrders ?? 0)} />
            <MetricCard label="Completed Work Orders" value={String(rollup?.completedWorkOrders ?? 0)} />
            <MetricCard label="Repeat Visits" value={String(rollup?.repeatVisitCount ?? 0)} />
            <MetricCard label="Latest Work Order" value={rollup?.latestWorkOrderNumber ?? "N/A"} />
          </div>

          {openQuestions.length ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">Open Questions</p>
              <div className="mt-2 space-y-1 text-sm text-amber-900">
                {openQuestions.map((question, index) => (
                  <p key={`${question}-${index}`}>{question}</p>
                ))}
              </div>
            </div>
          ) : null}

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
            <Link
              href={scopeBuilderHref}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Scope builder
            </Link>
          </div>
        </Card>

        <CaseOperationalPanel
          urgencyItems={urgencyItems as UrgencyPanelItem[]}
          timelineItems={timeline as TimelinePanelItem[]}
          decisionItems={decisionItems}
        />

        <Card>
          <details className="group">
            <summary className="cursor-pointer list-none rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
                Evidence Drawer - Full Case Record
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Expand to review complete raw fields, notes, match evidence, and work-order details.
              </p>
            </summary>

            <div className="mt-6 space-y-6">
              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  1. Case Snapshot
                </p>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Case {serviceCase.caseNumber} opened {formatDateTime(serviceCase.createdAt)}
                  </p>
                  <div className="mt-3 space-y-3">
                    <DetailGrid
                      rows={[
                        ["Case ID", serviceCase.id],
                        ["State", serviceCase.state],
                        ["Priority", serviceCase.priority],
                        ["Short Description", serviceCase.shortDescription],
                        ["Account", serviceCase.accountName],
                        ["Assignment Group", formatValue(serviceCase.assignmentGroup)],
                        ["Contract ID", formatValue(serviceCase.contractId)],
                        ["Entitlement", formatValue(serviceCase.entitlementName)],
                        ["Client Name", serviceCase.client.name],
                        ["Client Segment", serviceCase.client.segment],
                        ["Site Name", serviceCase.site.name],
                        ["Site City/State", `${serviceCase.site.city}, ${serviceCase.site.state}`],
                        ["Primary Contact", formatValue(serviceCase.primaryContact?.name)],
                        ["Contact Email", formatValue(serviceCase.primaryContact?.email)],
                        ["Open Work Order IDs", formatList(serviceCase.openWorkOrderIds)],
                        ["All Work Order IDs", formatList(serviceCase.workOrderIds)]
                      ]}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <details className="rounded-2xl border border-slate-200 p-4">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    2. Case Checkpoints (Collapsible)
                  </summary>
                  <div className="mt-4 space-y-3">
                    <DetailGrid
                      rows={[
                        ["Case Updated", formatDateTime(serviceCase.updatedAt)],
                        ["Case Resolved", formatDateTime(serviceCase.resolvedAt)],
                        ["Analysis Summary", serviceCase.analysis?.summary ?? "N/A"],
                        ["Analysis Categories", formatList(serviceCase.analysis?.categories)],
                        ["Matched Rules", formatList(serviceCase.analysis?.matchedRules)],
                        ["Scope Status", serviceCase.scope?.status ?? "N/A"],
                        ["Scope Confidence", serviceCase.scope ? String(serviceCase.scope.confidence) : "N/A"],
                        ["Validation Verdict", serviceCase.validation?.verdict ?? "N/A"],
                        ["Validation Confidence", serviceCase.validation ? String(serviceCase.validation.confidence) : "N/A"],
                        ["Missing BOM", formatList(serviceCase.validation?.missingBomItems)]
                      ]}
                    />
                    {serviceCase.caseSignals.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Case Signals</p>
                        {serviceCase.caseSignals.map((signal, index) => (
                          <div key={`${signal.type}-${index}`} className="rounded-2xl border border-slate-200 p-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {signal.type} ({signal.severity})
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              Next: {formatValue(signal.recommendation?.nextStep)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </details>
              </section>

              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  3. Case Narrative (Newest First)
                </p>

                <div className="space-y-4">
                  {narrativeEvents.map((event) =>
                    event.type === "case-note" ? (
                      <div key={event.id} className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-900">
                          Case Notes (Readable)
                        </p>
                        <div className="mt-2 rounded-xl border border-sky-200 bg-white p-3">
                          <p className="text-xs font-semibold text-slate-500">{formatDateTime(event.at)}</p>
                          <pre className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{event.note.text}</pre>
                        </div>
                      </div>
                    ) : (
                      <details key={event.id} className="rounded-2xl border border-slate-200 p-4">
                        <summary className="cursor-pointer">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="slate">Work Order</Badge>
                            <p className="text-sm font-semibold text-slate-900">
                              {event.workOrder.workOrderNumber} ({event.workOrder.state})
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Anchor date: {formatDateTime(getWorkOrderAnchorDate(event.workOrder))}
                          </p>
                        </summary>
                        <div className="mt-3">
                          <WorkOrderDetail workOrder={event.workOrder} />
                        </div>
                      </details>
                    )
                  )}

                  {!narrativeEvents.length ? (
                    <p className="text-sm text-slate-600">No case notes or work orders available for narrative view.</p>
                  ) : null}
                </div>
              </section>

              <section>
                <details className="rounded-2xl border border-slate-200 p-4">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    4. Raw Case Notes (Reference)
                  </summary>
                  <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                    {serviceCase.commentsAndWorkNotesRaw || "No case notes available."}
                  </pre>
                </details>
              </section>
            </div>
          </details>
        </Card>
      </div>
    </AppShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function WorkOrderDetail({ workOrder }: { workOrder: WorkOrder }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-900">{workOrder.workOrderNumber}</p>
      <DetailGrid
        rows={[
          ["Work Order ID", workOrder.id],
          ["Case Number", workOrder.caseNumber],
          ["State", workOrder.state],
          ["Scheduled Start", formatDateTime(workOrder.scheduledStart)],
          ["Assignment Group", formatValue(workOrder.assignmentGroup)],
          ["Assigned To", formatValue(workOrder.assignedTo)],
          ["Labor Source", formatValue(workOrder.laborSource)],
          ["Visit Purpose", formatValue(workOrder.visitPurpose)],
          ["Technician IDs", formatList(workOrder.technicianIds)],
          ["Created", formatDateTime(workOrder.createdAt)],
          ["Updated", formatDateTime(workOrder.updatedAt)],
          ["Closed", formatDateTime(workOrder.closedAt)]
        ]}
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Work Order Analysis</p>
        {workOrder.analysis ? (
          <div className="mt-2 space-y-3">
            <DetailGrid
              rows={[
                ["Summary", workOrder.analysis.summary],
                ["Categories", formatList(workOrder.analysis.categories)],
                ["Matched Rules", formatList(workOrder.analysis.matchedRules)],
                ["Skill Signals", formatList(workOrder.analysis.skillSignals)],
                ["Suggested Owner", formatValue(workOrder.analysis.ownerSuggestion)],
                ["Suggested Next Step", formatValue(workOrder.analysis.nextStepSuggestion)],
                ["Due Date Trigger", toYesNo(workOrder.analysis.dueDateTrigger)]
              ]}
            />
            <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
              {Object.entries(workOrder.analysis.flags).map(([flag, value]) => (
                <p key={flag}>
                  <span className="font-medium text-slate-900">{toLabel(flag)}:</span> {toYesNo(value)}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No work-order analysis available.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Work Order Signals</p>
        <div className="mt-2 space-y-2">
          {workOrder.workOrderSignals.length ? (
            workOrder.workOrderSignals.map((signal, index) => (
              <div key={`${signal.type}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">
                  {signal.type} ({signal.severity})
                </p>
                <p className="mt-1 text-sm text-slate-700">Next: {formatValue(signal.recommendation?.nextStep)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Matches: {signal.matches.length ? signal.matches.map((match) => match.ruleId).join(", ") : "None"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No work-order signals listed.</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Raw Work Notes</p>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
          {workOrder.workOrderWorkNotesRaw || "No work notes available."}
        </pre>
      </div>
    </div>
  );
}

function DetailGrid({ rows }: { rows: [string, string][] }) {
  return (
    <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
      {rows.map(([label, value], index) => (
        <p key={`${label}-${index}`}>
          <span className="font-medium text-slate-900">{label}:</span> {value}
        </p>
      ))}
    </div>
  );
}

function calculateHealthScore(serviceCase: ServiceCase, workOrders: WorkOrder[]) {
  let score = 100;
  const blocked = serviceCase.caseSignals.filter((signal) => signal.severity === "Blocked").length;
  const actionNeeded = serviceCase.caseSignals.filter((signal) => signal.severity === "Action Needed").length;
  const warning = serviceCase.caseSignals.filter((signal) => signal.severity === "Warning").length;

  score -= blocked * 25;
  score -= actionNeeded * 12;
  score -= warning * 6;

  if ((serviceCase.workOrderIds?.length ?? 0) > 1) {
    score -= 8;
  }

  if (serviceCase.scope?.status !== "Approved") {
    score -= 10;
  }

  if (serviceCase.validation?.verdict === "Likely Out of Scope") {
    score -= 20;
  }

  const openWorkOrders = workOrders.filter((workOrder) => !/closed|cancelled/i.test(workOrder.state)).length;
  if (openWorkOrders > 2) {
    score -= 6;
  }

  return Math.max(0, Math.min(100, score));
}

function getPrimaryAction(serviceCase: ServiceCase, workOrders: WorkOrder[]) {
  const blockedSignal = serviceCase.caseSignals.find((signal) => signal.severity === "Blocked");
  if (blockedSignal) {
    return blockedSignal.recommendation?.nextStep ?? blockedSignal.type;
  }

  const caseAction = serviceCase.caseSignals.find((signal) => signal.severity === "Action Needed");
  if (caseAction) {
    return caseAction.recommendation?.nextStep ?? caseAction.type;
  }

  const workOrderAction = workOrders
    .flatMap((workOrder) => workOrder.workOrderSignals)
    .find((signal) => signal.severity === "Action Needed");
  if (workOrderAction) {
    return workOrderAction.recommendation?.nextStep ?? workOrderAction.type;
  }

  return serviceCase.analysis?.nextStepSuggestion ?? "Review timeline and confirm next owner action.";
}

function hasDueDateTrigger(serviceCase: ServiceCase, workOrders: WorkOrder[]) {
  if (serviceCase.analysis?.dueDateTrigger) {
    return true;
  }

  if (serviceCase.caseSignals.some((signal) => signal.recommendation?.dueDateTrigger)) {
    return true;
  }

  return workOrders.some(
    (workOrder) =>
      workOrder.analysis?.dueDateTrigger ||
      workOrder.workOrderSignals.some((signal) => signal.recommendation?.dueDateTrigger)
  );
}

function deriveOpenQuestions(serviceCase: ServiceCase, workOrders: WorkOrder[]) {
  const questions: string[] = [];

  if (serviceCase.scope?.status !== "Approved") {
    questions.push("Is scope ready for dispatch approval?");
  }

  if (serviceCase.validation?.missingBomItems.length) {
    questions.push("Who will resolve missing BOM alignment items?");
  }

  if (serviceCase.caseSignals.some((signal) => signal.type === "Approval Needed")) {
    questions.push("Which stakeholder is approving next action?");
  }

  if (workOrders.some((workOrder) => !workOrder.assignedTo)) {
    questions.push("Which technician should own unassigned work orders?");
  }

  if (!serviceCase.primaryContact?.email && !serviceCase.primaryContact?.mobilePhone) {
    questions.push("Do we have enough contact details for scheduling?");
  }

  return [...new Set(questions)];
}

function buildUrgencyItems(serviceCase: ServiceCase, workOrders: WorkOrder[]) {
  const caseItems: UrgencyItem[] = serviceCase.caseSignals.map((signal, index) => ({
    id: `case-${signal.type}-${index}`,
    severity: signal.severity,
    label: signal.type,
    source: `Case ${serviceCase.caseNumber}`,
    nextStep: signal.recommendation?.nextStep ?? "Review and assign next action."
  }));

  const workOrderItems: UrgencyItem[] = workOrders.flatMap((workOrder) =>
    workOrder.workOrderSignals.map((signal, index) => ({
      id: `wo-${workOrder.workOrderNumber}-${signal.type}-${index}`,
      severity: signal.severity,
      label: signal.type,
      source: `WO ${workOrder.workOrderNumber}`,
      nextStep: signal.recommendation?.nextStep ?? "Review and assign next action."
    }))
  );

  return [...caseItems, ...workOrderItems].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

function deriveDispatchReadiness(serviceCase: ServiceCase, urgencyItems: UrgencyItem[]) {
  const blockers: string[] = [];

  if (serviceCase.scope?.status !== "Approved") {
    blockers.push("Scope not approved");
  }

  if (serviceCase.validation?.verdict === "Likely Out of Scope") {
    blockers.push("Validation indicates out-of-scope risk");
  }

  urgencyItems
    .filter((item) => item.severity === "Blocked")
    .forEach((item) => blockers.push(item.label));

  if (blockers.length) {
    return { label: "Not Ready", tone: "red" as const, blockers: [...new Set(blockers)] };
  }

  const watchItems = urgencyItems.filter((item) => item.severity === "Action Needed" || item.severity === "Warning").length;
  if (watchItems > 0) {
    return { label: "Conditionally Ready", tone: "amber" as const, blockers: ["Active watch items"] };
  }

  return { label: "Ready", tone: "green" as const, blockers: [] };
}

function buildDecisionItems(
  serviceCase: ServiceCase,
  readiness: ReturnType<typeof deriveDispatchReadiness>
): DecisionPanelItem[] {
  return [
    {
      id: "scope",
      title: "Scope",
      tone: serviceCase.scope?.status === "Approved" ? "green" : "amber",
      rows: [
        ["Status", serviceCase.scope?.status ?? "N/A"],
        ["Confidence", serviceCase.scope ? String(serviceCase.scope.confidence) : "N/A"],
        ["Sections", serviceCase.scope ? String(serviceCase.scope.sections.length) : "0"]
      ]
    },
    {
      id: "validation",
      title: "Validation",
      tone:
        serviceCase.validation?.verdict === "Likely Out of Scope"
          ? "red"
          : serviceCase.validation?.verdict === "Possibly Aligned"
            ? "amber"
            : "green",
      rows: [
        ["Verdict", serviceCase.validation?.verdict ?? "N/A"],
        ["Confidence", serviceCase.validation ? String(serviceCase.validation.confidence) : "N/A"],
        ["Missing BOM Items", serviceCase.validation ? String(serviceCase.validation.missingBomItems.length) : "0"]
      ]
    },
    {
      id: "dispatch-readiness",
      title: "Dispatch Readiness",
      tone: readiness.tone,
      rows: [
        ["Readiness", readiness.label],
        ["Blocking Items", String(readiness.blockers.length)],
        ["Primary Blocker", readiness.blockers[0] ?? "None"]
      ]
    }
  ];
}

function buildTimeline(serviceCase: ServiceCase, workOrders: WorkOrder[]) {
  const events: TimelineEvent[] = [];

  if (serviceCase.createdAt) {
    events.push({
      id: "case-created",
      at: serviceCase.createdAt,
      title: "Case created",
      detail: `State: ${serviceCase.state}`,
      source: "Case"
    });
  }

  if (serviceCase.updatedAt) {
    events.push({
      id: "case-updated",
      at: serviceCase.updatedAt,
      title: "Case updated",
      detail: serviceCase.analysis?.summary ?? "Case updated",
      source: "Case"
    });
  }

  if (serviceCase.resolvedAt) {
    events.push({
      id: "case-resolved",
      at: serviceCase.resolvedAt,
      title: "Case resolved",
      detail: "Case reached resolved state",
      source: "Case"
    });
  }

  workOrders.forEach((workOrder) => {
    if (workOrder.scheduledStart) {
      events.push({
        id: `${workOrder.workOrderNumber}-scheduled`,
        at: workOrder.scheduledStart,
        title: `${workOrder.workOrderNumber} scheduled`,
        detail: `${workOrder.state} - ${workOrder.assignedTo ?? "Unassigned"}`,
        source: "Work Order"
      });
    }

    if (workOrder.updatedAt && workOrder.updatedAt !== workOrder.scheduledStart) {
      events.push({
        id: `${workOrder.workOrderNumber}-updated`,
        at: workOrder.updatedAt,
        title: `${workOrder.workOrderNumber} updated`,
        detail: workOrder.analysis?.summary ?? "Work order updated",
        source: "Work Order"
      });
    }

    if (workOrder.closedAt) {
      events.push({
        id: `${workOrder.workOrderNumber}-closed`,
        at: workOrder.closedAt,
        title: `${workOrder.workOrderNumber} closed`,
        detail: "Work order reached closed state",
        source: "Work Order"
      });
    }
  });

  if (!events.length && serviceCase.analysis?.summary) {
    events.push({
      id: "case-analysis",
      title: "Case analysis available",
      detail: serviceCase.analysis.summary,
      source: "Case"
    });
  }

  return events.sort((a, b) => sortDateDesc(a.at, b.at));
}

function sortWorkOrdersChronological(workOrders: WorkOrder[]) {
  return [...workOrders].sort((a, b) => {
    const aAnchor = toTime(getWorkOrderAnchorDate(a));
    const bAnchor = toTime(getWorkOrderAnchorDate(b));
    return aAnchor - bAnchor;
  });
}

function getWorkOrderAnchorDate(workOrder: WorkOrder) {
  return workOrder.scheduledStart ?? workOrder.createdAt ?? workOrder.updatedAt ?? workOrder.closedAt;
}

function toTime(value?: string) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function sortDateDesc(a?: string, b?: string) {
  const aTime = a ? new Date(a).getTime() : Number.NEGATIVE_INFINITY;
  const bTime = b ? new Date(b).getTime() : Number.NEGATIVE_INFINITY;

  if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
    return 0;
  }

  if (Number.isNaN(aTime)) {
    return 1;
  }

  if (Number.isNaN(bTime)) {
    return -1;
  }

  return bTime - aTime;
}

function extractCaseNoteEntries(rawNotes: string) {
  const lines = rawNotes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [] as CaseNoteEntry[];
  }

  const entries: CaseNoteEntry[] = [];
  const timestampLinePattern = /^(\d{1,2}-[A-Za-z]{3}-\d{2}\s+\d{2}:\d{2}:\d{2})(?:\s*-\s*)?(.*)$/;
  let current: CaseNoteEntry | null = null;

  lines.forEach((line, index) => {
    const timestampMatch = line.match(timestampLinePattern);

    if (timestampMatch) {
      const at = parseCaseTimestamp(timestampMatch[1]);
      current = {
        id: `case-note-${index}`,
        at: at ?? undefined,
        text: line
      };
      entries.push(current);
      return;
    }

    if (!current) {
      current = {
        id: `case-note-${index}`,
        at: undefined,
        text: line
      };
      entries.push(current);
      return;
    }

    current.text = `${current.text}\n${line}`;
  });

  return entries;
}

function buildCaseNarrativeEvents(caseNotes: CaseNoteEntry[], workOrders: WorkOrder[]) {
  const noteEvents: CaseNarrativeEvent[] = caseNotes.map((note) => ({
    id: `case-note-event-${note.id}`,
    type: "case-note",
    at: note.at,
    note
  }));

  const workOrderEvents: CaseNarrativeEvent[] = workOrders.map((workOrder) => ({
    id: `work-order-event-${workOrder.id}`,
    type: "work-order",
    at: getWorkOrderAnchorDate(workOrder),
    workOrder
  }));

  return [...noteEvents, ...workOrderEvents].sort((a, b) => sortDateDesc(a.at, b.at));
}

function parseCaseTimestamp(value: string) {
  const match = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const monthToken = match[2].toLowerCase();
  const year = 2000 + Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  const monthLookup: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11
  };

  const month = monthLookup[monthToken];
  if (month === undefined) {
    return null;
  }

  const date = new Date(year, month, day, hour, minute, second);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function severityRank(severity: SignalSeverity) {
  if (severity === "Blocked") {
    return 0;
  }

  if (severity === "Action Needed") {
    return 1;
  }

  if (severity === "Warning") {
    return 2;
  }

  return 3;
}

function formatDateTime(value?: string) {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function formatValue(value?: string) {
  return value?.trim() ? value : "N/A";
}

function formatList(values?: string[]) {
  return values?.length ? values.join(", ") : "None";
}

function toYesNo(value?: boolean) {
  return value ? "Yes" : "No";
}

function toLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
}

function buildScopeBuilderHref(serviceCase: ServiceCase): Route {
  const params = new URLSearchParams({
    case: serviceCase.caseNumber,
    client: serviceCase.client.name,
    site: serviceCase.site.name,
    city: serviceCase.site.address?.city ?? serviceCase.site.city ?? "",
    state: serviceCase.site.address?.stateOrProvince ?? serviceCase.site.state ?? "",
    address: formatSiteAddress(serviceCase),
    contactName: serviceCase.primaryContact?.name ?? "",
    contactEmail: serviceCase.primaryContact?.email ?? "",
    contactPhone: serviceCase.primaryContact?.mobilePhone ?? serviceCase.primaryContact?.businessPhone ?? ""
  });
  return `/scope-builder?${params.toString()}` as Route;
}

function formatSiteAddress(serviceCase: ServiceCase) {
  const address = serviceCase.site.address;
  if (!address) {
    return "";
  }
  return `${address.street}, ${address.city}, ${address.stateOrProvince} ${address.postalCode}`.trim();
}
