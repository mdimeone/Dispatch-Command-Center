import {
  DispatchRecord,
  ServiceCase,
  ValidationVerdict,
  WorkOrder
} from "@/types/domain";
import { technicians } from "@/lib/data/sample-data";

export function attachTechnicians(serviceCase: ServiceCase): ServiceCase {
  return {
    ...serviceCase,
    site: {
      ...serviceCase.site,
      region: serviceCase.site.region ?? "National"
    }
  };
}

export function attachTechnicianIds(workOrder: WorkOrder): WorkOrder {
  return {
    ...workOrder,
    technicianIds: technicians
      .filter((technician) => technician.name === workOrder.assignedTo)
      .map((technician) => technician.id)
  };
}

export function toDispatchRecord(
  workOrder: WorkOrder,
  serviceCase?: ServiceCase
): DispatchRecord | null {
  if (!serviceCase) {
    return null;
  }

  const riskNotes = buildRiskNotes(serviceCase, workOrder);
  const assignedTechIds = workOrder.technicianIds;
  const validation = serviceCase.validation ?? {
    verdict: "Aligned" as ValidationVerdict,
    confidence: 80,
    matchedBomItems: [],
    missingBomItems: [],
    reviewerNotes: []
  };

  return {
    id: workOrder.workOrderNumber,
    caseNumber: serviceCase.caseNumber,
    projectName: serviceCase.site.name,
    visitPurpose: serviceCase.shortDescription,
    visitDate: workOrder.scheduledStart ?? "2026-04-06T08:00:00-04:00",
    status: deriveDispatchStatus(serviceCase, riskNotes),
    urgency: mapPriorityToUrgency(serviceCase.priority),
    laborSource: workOrder.laborSource ?? "Internal",
    region: serviceCase.site.region ?? "National",
    supervisor: workOrder.assignmentGroup ?? serviceCase.assignmentGroup ?? "Unassigned",
    assignedTechIds,
    blockers: riskNotes.blockers,
    notes: [
      `Assigned: ${workOrder.assignedTo ?? "Unassigned"}`,
      `Owner: ${workOrder.analysis?.ownerSuggestion ?? serviceCase.analysis?.ownerSuggestion ?? "Case Manager"}`,
      `Next: ${
        workOrder.analysis?.nextStepSuggestion ??
        serviceCase.analysis?.nextStepSuggestion ??
        "Review case history and confirm next action."
      }`,
      `Skills: ${
        uniqueValues([...(serviceCase.analysis?.skillSignals ?? []), ...(workOrder.analysis?.skillSignals ?? [])]).join(", ") ||
        "General Troubleshooting"
      }`,
      serviceCase.analysis?.summary ?? "",
      workOrder.analysis?.summary ?? ""
    ].filter(Boolean),
    client: serviceCase.client,
    site: serviceCase.site,
    weather: buildWeatherSignal(serviceCase.site.region),
    traffic: buildTrafficSignal(serviceCase.site.region),
    scope: serviceCase.scope ?? {
      id: `scope-${serviceCase.caseNumber}`,
      caseNumber: serviceCase.caseNumber,
      status: "Draft",
      confidence: 70,
      versions: [],
      sections: []
    },
    validation
  };
}

function buildRiskNotes(serviceCase: ServiceCase, workOrder: WorkOrder) {
  const blockers: string[] = [];

  if (serviceCase.analysis?.flags.approvalNeeded) {
    blockers.push("Approval Needed");
  }

  if (serviceCase.analysis?.flags.partsRelated || workOrder.analysis?.flags.shipmentMentioned) {
    blockers.push("Parts / Shipment");
  }

  if (serviceCase.analysis?.flags.remoteSupportSuggested || workOrder.analysis?.flags.remoteSupportSuggested) {
    blockers.push("Remote Support");
  }

  if (serviceCase.workOrderIds.length > 1) {
    blockers.push("Repeat Dispatch");
  }

  if (workOrder.analysis?.flags.schedulingNeeded) {
    blockers.push("Schedule Coordination");
  }

  return { blockers: uniqueValues(blockers) };
}

function deriveDispatchStatus(
  serviceCase: ServiceCase,
  riskNotes: { blockers: string[] }
): DispatchRecord["status"] {
  if (riskNotes.blockers.length >= 2) {
    return "At Risk";
  }

  if (serviceCase.scope?.status === "In Review") {
    return "Scope Drafted";
  }

  if (serviceCase.scope?.status === "Approved") {
    return "Ready to Dispatch";
  }

  return "Needs Scope";
}

function mapPriorityToUrgency(priority: string): DispatchRecord["urgency"] {
  if (/1|2/i.test(priority)) {
    return "High";
  }

  if (/3/i.test(priority)) {
    return "Medium";
  }

  return "Low";
}

function buildWeatherSignal(region?: string) {
  if (region === "Southeast") {
    return { summary: "Warm with scattered storms", temperatureF: 74, severeRisk: "Moderate" as const };
  }

  if (region === "Mid-Atlantic") {
    return { summary: "Cloud cover with wind risk", temperatureF: 61, severeRisk: "Moderate" as const };
  }

  return { summary: "Clear to partly cloudy", temperatureF: 58, severeRisk: "Low" as const };
}

function buildTrafficSignal(region?: string) {
  if (region === "Northeast") {
    return { etaMinutes: 48, routeRisk: "High" as const, leaveBy: "07:10 AM" };
  }

  if (region === "Mid-Atlantic") {
    return { etaMinutes: 41, routeRisk: "Moderate" as const, leaveBy: "08:00 AM" };
  }

  return { etaMinutes: 36, routeRisk: "Moderate" as const, leaveBy: "08:20 AM" };
}

function uniqueValues<T>(values: T[]) {
  return [...new Set(values)];
}
