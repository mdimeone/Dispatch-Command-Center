import { analyzeNoteText } from "@/lib/analysis/notes/analyzer";
import {
  CaseSignal,
  Scope,
  ServiceCase,
  SignalMatch,
  ValidationResult,
  WorkOrder,
  WorkOrderSignal
} from "@/types/domain";

export interface WorkOrdersOpenCasesRow {
  workOrderNumber: string;
  workOrderState: string;
  workOrderScheduledStart?: string;
  workOrderWorkNotes: string;
  workOrderAssignmentGroup?: string;
  workOrderAssignedTo?: string;
  caseNumber: string;
  caseState: string;
  caseAssignmentGroup?: string;
  account: string;
  siteName: string;
  caseShortDescription: string;
  street: string;
  city: string;
  stateOrProvince: string;
  zipOrPostalCode: string;
  country: string;
  priority: string;
  contactName?: string;
  email?: string;
  mobilePhone?: string;
  businessPhone?: string;
  contract?: string;
  entitlement?: string;
  commentsAndWorkNotes: string;
}

export interface ParsedWorkOrdersOpenCasesData {
  cases: ServiceCase[];
  workOrders: WorkOrder[];
}

export function parseWorkOrdersOpenCasesRows(
  rows: WorkOrdersOpenCasesRow[]
): ParsedWorkOrdersOpenCasesData {
  const workOrders = rows.map<WorkOrder>((row) => {
    const analysis = analyzeNoteText(row.workOrderWorkNotes);

    return {
      id: row.workOrderNumber,
      workOrderNumber: row.workOrderNumber,
      caseNumber: row.caseNumber,
      state: row.workOrderState,
      scheduledStart: row.workOrderScheduledStart,
      assignmentGroup: row.workOrderAssignmentGroup,
      assignedTo: row.workOrderAssignedTo,
      laborSource: inferLaborSource(row.workOrderAssignmentGroup),
      visitPurpose: row.caseShortDescription,
      workOrderWorkNotesRaw: row.workOrderWorkNotes,
      analysis,
      workOrderSignals: buildWorkOrderSignals(analysis.matchedRules, analysis.summary, analysis.flags),
      technicianIds: [],
      createdAt: row.workOrderScheduledStart,
      updatedAt: row.workOrderScheduledStart,
      closedAt: isClosedState(row.workOrderState) ? row.workOrderScheduledStart : undefined
    };
  });

  const groupedRows = groupRowsByCase(rows);

  const cases = [...groupedRows.entries()].map<ServiceCase>(([caseNumber, caseRows]) => {
    const firstRow = caseRows[0];
    const caseWorkOrders = workOrders.filter((workOrder) => workOrder.caseNumber === caseNumber);
    const caseNotes = pickCaseNotes(caseRows);
    const analysis = analyzeNoteText(caseNotes);

    return {
      id: caseNumber,
      caseNumber,
      state: firstRow.caseState,
      priority: firstRow.priority,
      shortDescription: firstRow.caseShortDescription,
      assignmentGroup: firstRow.caseAssignmentGroup,
      accountName: firstRow.account,
      contractId: firstRow.contract,
      entitlementName: firstRow.entitlement,
      client: {
        id: slugify(firstRow.account),
        name: firstRow.account,
        segment: inferSegment(firstRow.account)
      },
      site: {
        id: `${slugify(firstRow.account)}-${slugify(firstRow.siteName)}`,
        name: firstRow.siteName,
        city: firstRow.city,
        state: firstRow.stateOrProvince,
        timezone: inferTimezone(firstRow.stateOrProvince),
        accessNotes: buildAccessNote(firstRow.country, firstRow.siteName),
        region: inferRegion(firstRow.stateOrProvince, firstRow.country),
        address: {
          street: firstRow.street,
          city: firstRow.city,
          stateOrProvince: firstRow.stateOrProvince,
          postalCode: firstRow.zipOrPostalCode,
          country: firstRow.country
        }
      },
      primaryContact: firstRow.contactName
        ? {
            name: firstRow.contactName,
            email: firstRow.email || undefined,
            mobilePhone: firstRow.mobilePhone || undefined,
            businessPhone: firstRow.businessPhone || undefined
          }
        : undefined,
      commentsAndWorkNotesRaw: caseNotes,
      analysis,
      caseSignals: buildCaseSignals(
        analysis.matchedRules,
        analysis.summary,
        analysis.flags,
        caseWorkOrders.length
      ),
      openWorkOrderIds: caseWorkOrders
        .filter((workOrder) => !isClosedState(workOrder.state))
        .map((workOrder) => workOrder.id),
      workOrderIds: caseWorkOrders.map((workOrder) => workOrder.id),
      scope: buildScope(firstRow.caseNumber, firstRow.caseShortDescription, analysis.summary),
      validation: buildValidation(firstRow.priority, analysis.flags.repeatDispatchRisk),
      createdAt: earliestScheduledStart(caseWorkOrders),
      updatedAt: latestScheduledStart(caseWorkOrders),
      resolvedAt: caseWorkOrders.every((workOrder) => isClosedState(workOrder.state))
        ? latestScheduledStart(caseWorkOrders)
        : undefined
    };
  });

  return {
    cases: cases.sort((a, b) => a.caseNumber.localeCompare(b.caseNumber)),
    workOrders: workOrders.sort(sortWorkOrders)
  };
}

function groupRowsByCase(rows: WorkOrdersOpenCasesRow[]) {
  const map = new Map<string, WorkOrdersOpenCasesRow[]>();

  for (const row of rows) {
    const current = map.get(row.caseNumber) ?? [];
    current.push(row);
    map.set(row.caseNumber, current);
  }

  return map;
}

function buildWorkOrderSignals(
  matchedRules: string[],
  summary: string,
  flags: {
    partsRelated: boolean;
    shipmentMentioned: boolean;
    approvalNeeded: boolean;
    schedulingNeeded: boolean;
    remoteSupportSuggested: boolean;
    vendorFollowupSuggested: boolean;
    repeatDispatchRisk: boolean;
  }
): WorkOrderSignal[] {
  const signals: WorkOrderSignal[] = [];

  if (flags.schedulingNeeded) {
    signals.push(createWorkOrderSignal("Scheduled", "Warning", summary, matchedRules));
  }

  if (flags.shipmentMentioned) {
    signals.push(createWorkOrderSignal("Parts Delivered", "Info", summary, matchedRules));
  }

  if (flags.remoteSupportSuggested) {
    signals.push(createWorkOrderSignal("Remote Support", "Action Needed", summary, matchedRules));
  }

  if (matchedRules.includes("testing-validation")) {
    signals.push(createWorkOrderSignal("Testing Required", "Warning", summary, matchedRules));
  }

  if (flags.repeatDispatchRisk) {
    signals.push(createWorkOrderSignal("Return Visit Needed", "Action Needed", summary, matchedRules));
  }

  return signals;
}

function buildCaseSignals(
  matchedRules: string[],
  summary: string,
  flags: {
    partsRelated: boolean;
    shipmentMentioned: boolean;
    approvalNeeded: boolean;
    schedulingNeeded: boolean;
    remoteSupportSuggested: boolean;
    vendorFollowupSuggested: boolean;
    repeatDispatchRisk: boolean;
  },
  totalWorkOrders: number
): CaseSignal[] {
  const signals: CaseSignal[] = [];

  if (flags.approvalNeeded) {
    signals.push(createCaseSignal("Approval Needed", "Blocked", summary, matchedRules));
  }

  if (flags.partsRelated || flags.shipmentMentioned) {
    signals.push(createCaseSignal("Parts In Play", "Warning", summary, matchedRules));
  }

  if (flags.vendorFollowupSuggested) {
    signals.push(createCaseSignal("Vendor Follow-Up", "Action Needed", summary, matchedRules));
  }

  if (flags.remoteSupportSuggested) {
    signals.push(createCaseSignal("Remote Support Needed", "Action Needed", summary, matchedRules));
  }

  if (flags.repeatDispatchRisk || totalWorkOrders > 1) {
    signals.push(createCaseSignal("Repeat Dispatch", "Action Needed", summary, matchedRules));
  }

  return signals;
}

function createCaseSignal(
  type: CaseSignal["type"],
  severity: CaseSignal["severity"],
  summary: string,
  matchedRules: string[]
): CaseSignal {
  return {
    type,
    severity,
    skillTags: [],
    recommendation: {
      nextStep: summary
    },
    matches: matchedRulesToSignalMatches(matchedRules, summary)
  };
}

function createWorkOrderSignal(
  type: WorkOrderSignal["type"],
  severity: WorkOrderSignal["severity"],
  summary: string,
  matchedRules: string[]
): WorkOrderSignal {
  return {
    type,
    severity,
    skillTags: [],
    recommendation: {
      nextStep: summary
    },
    matches: matchedRulesToSignalMatches(matchedRules, summary)
  };
}

function matchedRulesToSignalMatches(matchedRules: string[], summary: string): SignalMatch[] {
  return matchedRules.map((ruleId) => ({
    ruleId,
    category: ruleId,
    matchedText: [summary],
    confidence: 100
  }));
}

function buildScope(caseNumber: string, shortDescription: string, noteSummary: string): Scope {
  return {
    id: `scope-${caseNumber}`,
    caseNumber,
    status: /approval|awaiting/i.test(noteSummary) ? "Draft" : "In Review",
    confidence: /network|remote/i.test(noteSummary) ? 68 : 82,
    versions: [
      {
        id: `scope-${caseNumber}-v1`,
        label: "Initial imported context",
        updatedAt: "2026-04-05T18:00:00-04:00",
        updatedBy: "System"
      }
    ],
    sections: [
      {
        id: "reason",
        title: "Reason for Visit",
        body: shortDescription
      },
      {
        id: "context",
        title: "Case Context",
        body: noteSummary || "Review prior case and work-order history before dispatch."
      }
    ]
  };
}

function buildValidation(priority: string, repeatDispatchRisk: boolean): ValidationResult {
  return {
    verdict: repeatDispatchRisk ? "Possibly Aligned" : "Aligned",
    confidence: priority.startsWith("2") ? 74 : 88,
    matchedBomItems: repeatDispatchRisk ? ["Existing room hardware"] : ["Service scope reference"],
    missingBomItems: repeatDispatchRisk ? ["Repeat-visit root cause confirmation"] : [],
    reviewerNotes: repeatDispatchRisk
      ? [
          "Repeat onsite activity detected. Confirm whether this remains corrective service or requires expanded scope handling."
        ]
      : ["Issue appears within expected service scope based on current case context."]
  };
}

function pickCaseNotes(rows: WorkOrdersOpenCasesRow[]) {
  return rows
    .map((row) => row.commentsAndWorkNotes)
    .sort((a, b) => b.length - a.length)[0];
}

function inferSegment(account: string) {
  if (/university|college/i.test(account)) {
    return "Education";
  }

  if (/vanguard|christie/i.test(account)) {
    return "Enterprise";
  }

  if (/health|amsurg/i.test(account)) {
    return "Healthcare";
  }

  return "Commercial";
}

function inferLaborSource(group?: string) {
  return /tek/i.test(group ?? "") ? "Subcontractor" : "Internal";
}

function inferRegion(state: string, country: string) {
  if (country !== "United States") {
    return "International";
  }

  if (
    ["AK", "AZ", "CA", "CO", "HI", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY"].includes(
      state
    )
  ) {
    return "West";
  }

  if (
    [
      "AR",
      "IA",
      "IL",
      "IN",
      "KS",
      "LA",
      "MI",
      "MN",
      "MO",
      "ND",
      "NE",
      "OH",
      "OK",
      "SD",
      "TX",
      "WI"
    ].includes(state)
  ) {
    return "Central";
  }

  if (
    [
      "CT",
      "DC",
      "DE",
      "MA",
      "MD",
      "ME",
      "NH",
      "NJ",
      "NY",
      "PA",
      "RI",
      "VA",
      "VT",
      "WV"
    ].includes(state)
  ) {
    return "Northeast";
  }

  if (["AL", "FL", "GA", "KY", "MS", "NC", "SC", "TN"].includes(state)) {
    return "Southeast";
  }

  return "National";
}

function inferTimezone(state: string) {
  if (["TN"].includes(state)) {
    return "America/Chicago";
  }

  return "America/New_York";
}

function buildAccessNote(country: string, siteName: string) {
  if (country !== "United States") {
    return "Confirm local site access rules before scheduling.";
  }

  return `Review access details for ${siteName} before dispatch.`;
}

function earliestScheduledStart(workOrders: WorkOrder[]) {
  return [...workOrders]
    .sort(sortWorkOrders)
    .map((workOrder) => workOrder.scheduledStart)
    .find(Boolean);
}

function latestScheduledStart(workOrders: WorkOrder[]) {
  return [...workOrders]
    .sort((a, b) => sortWorkOrders(b, a))
    .map((workOrder) => workOrder.scheduledStart)
    .find(Boolean);
}

function sortWorkOrders(a: WorkOrder, b: WorkOrder) {
  return new Date(a.scheduledStart ?? 0).getTime() - new Date(b.scheduledStart ?? 0).getTime();
}

function isClosedState(state: string) {
  return /closed|cancelled/i.test(state);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

