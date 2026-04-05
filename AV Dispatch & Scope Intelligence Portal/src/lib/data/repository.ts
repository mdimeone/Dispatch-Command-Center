import {
  dashboardMetrics,
  dispatchRecords,
  projects,
  queues,
  technicians
} from "@/lib/data/sample-data";

export function getDashboardSnapshot() {
  return {
    metrics: dashboardMetrics,
    queues,
    featuredDispatches: dispatchRecords.slice(0, 3)
  };
}

export function getDispatches() {
  return dispatchRecords;
}

export function getDispatchById(id: string) {
  return dispatchRecords.find((record) => record.id === id) ?? null;
}

export function getCaseByNumber(caseNumber: string) {
  return dispatchRecords.find((record) => record.caseNumber === caseNumber) ?? null;
}

export function getProjects() {
  return projects;
}

export function getTechniciansForDispatch(assignedTechIds: string[]) {
  return technicians.filter((technician) => assignedTechIds.includes(technician.id));
}

export function getReviewQueue() {
  return dispatchRecords.filter(
    (record) => record.scope.status === "In Review" || record.validation.verdict !== "Aligned"
  );
}

export function getValidationQueue() {
  return dispatchRecords.map((record) => ({
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
      { week: "Wk 1", scopes: 12 },
      { week: "Wk 2", scopes: 18 },
      { week: "Wk 3", scopes: 15 },
      { week: "Wk 4", scopes: 22 }
    ],
    supervisorLoad: [
      { supervisor: "Alyssa Grant", active: 11 },
      { supervisor: "Renee Foster", active: 7 },
      { supervisor: "Corey Wade", active: 6 }
    ]
  };
}
