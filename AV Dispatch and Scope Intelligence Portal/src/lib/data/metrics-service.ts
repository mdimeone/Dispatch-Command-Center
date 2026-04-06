import { DashboardMetric, QueueItem } from "@/types/domain";
import { DataStore } from "@/lib/data/data-store";

export function getDashboardSnapshot(store: DataStore) {
  const metrics = buildDashboardMetrics(store);
  const queues = buildQueueItems(store);
  const featuredDispatches = [...store.dispatchRecords]
    .sort((a, b) => riskScore(b) - riskScore(a))
    .slice(0, 3);

  return {
    metrics,
    queues,
    featuredDispatches
  };
}

export function getReviewQueue(store: DataStore) {
  return store.dispatchRecords.filter(
    (record) => record.scope.status === "In Review" || record.validation.verdict !== "Aligned"
  );
}

export function getValidationQueue(store: DataStore) {
  return store.dispatchRecords.map((record) => ({
    id: record.id,
    caseNumber: record.caseNumber,
    client: record.client.name,
    projectName: record.projectName,
    verdict: record.validation.verdict,
    confidence: record.validation.confidence,
    missingBomItems: record.validation.missingBomItems,
    reviewerNotes: record.validation.reviewerNotes
  }));
}

export function getReportsSnapshot() {
  return {
    scopeDraftingTrend: [
      { week: "Wk 1", scopes: 8 },
      { week: "Wk 2", scopes: 11 },
      { week: "Wk 3", scopes: 10 },
      { week: "Wk 4", scopes: 14 }
    ],
    supervisorLoad: [
      { supervisor: "TEK Systems", active: 3 },
      { supervisor: "Diversified Internal", active: 3 },
      { supervisor: "US_ServiceDesk_WorkplaceAVE_L1", active: 2 }
    ]
  };
}

function buildDashboardMetrics(store: DataStore): DashboardMetric[] {
  const needsScope = store.dispatchRecords.filter((record) => record.status === "Needs Scope").length;
  const atRisk = store.dispatchRecords.filter((record) => record.status === "At Risk").length;
  const aligned = store.dispatchRecords.filter((record) => record.validation.verdict === "Aligned").length;
  const confidenceAverage = Math.round(
    store.dispatchRecords.reduce((total, record) => total + record.scope.confidence, 0) /
      Math.max(store.dispatchRecords.length, 1)
  );

  const workOrderCountByCase = new Map<string, number>();
  for (const workOrder of store.workOrders) {
    workOrderCountByCase.set(workOrder.caseNumber, (workOrderCountByCase.get(workOrder.caseNumber) ?? 0) + 1);
  }
  const repeatDispatchCases = [...workOrderCountByCase.values()].filter((count) => count > 1).length;

  return [
    {
      label: "Weekly Work Orders",
      value: String(store.dispatchRecords.length),
      detail: `${needsScope} still need scope refinement`,
      tone: "default"
    },
    {
      label: "Scope Confidence",
      value: `${confidenceAverage}%`,
      detail: `${aligned} dispatches look aligned with current service intent`,
      tone: "positive"
    },
    {
      label: "At-Risk Visits",
      value: String(atRisk),
      detail: "Approval, repeat-visit, or remote-support dependencies",
      tone: "warning"
    },
    {
      label: "Repeat-Dispatch Cases",
      value: String(repeatDispatchCases),
      detail: "Cases carrying multiple onsite visits before resolution",
      tone: "danger"
    }
  ];
}

function buildQueueItems(store: DataStore): QueueItem[] {
  const reviewReady = store.dispatchRecords.filter((record) => record.scope.status === "In Review").length;
  const remoteSupport = store.dispatchRecords.filter((record) =>
    record.notes.some((note) => /remote support|tier 3|rce/i.test(note))
  ).length;

  return [
    {
      id: "queue-1",
      title: "Needs Scope",
      description: "Work orders that still need a tighter next-step plan or customer-safe scope language.",
      count: store.dispatchRecords.filter((record) => record.status === "Needs Scope").length
    },
    {
      id: "queue-2",
      title: "Needs Attention",
      description: "Visits carrying blockers, approvals, parts, or repeat-dispatch risk.",
      count: store.dispatchRecords.filter((record) => record.status === "At Risk").length
    },
    {
      id: "queue-3",
      title: "Remote / Tier 3",
      description: "Cases with note signals suggesting remote escalation or specialist review.",
      count: remoteSupport
    },
    {
      id: "queue-4",
      title: "Review Ready",
      description: "Cases whose current scope context is ready for supervisor review.",
      count: reviewReady
    }
  ];
}

function riskScore(record: DataStore["dispatchRecords"][number]) {
  return record.blockers.length * 10 + (record.urgency === "High" ? 5 : record.urgency === "Medium" ? 3 : 1);
}
