export type DispatchStatus =
  | "Needs Scope"
  | "Scope Drafted"
  | "Ready to Dispatch"
  | "At Risk"
  | "Blocked";

export type ValidationVerdict =
  | "Aligned"
  | "Possibly Aligned"
  | "Likely Out of Scope";

export type SignalSeverity = "Info" | "Warning" | "Action Needed" | "Blocked";

export type SkillSignal =
  | "Networking"
  | "Remote Support"
  | "Programming"
  | "DSP"
  | "Control"
  | "Displays"
  | "Vendor Coordination"
  | "Shipping / Logistics"
  | "Client Coordination"
  | "General Troubleshooting";

export interface Client {
  id: string;
  name: string;
  segment: string;
}

export interface Site {
  id: string;
  name: string;
  city: string;
  state: string;
  timezone: string;
  accessNotes: string;
  address?: SiteAddress;
  region?: string;
}

export interface SiteAddress {
  street: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
}

export interface Contact {
  name: string;
  email?: string;
  mobilePhone?: string;
  businessPhone?: string;
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  homeBase: string;
  skillTags: string[];
}

export interface ScopeSection {
  id: string;
  title: string;
  body: string;
}

export interface ScopeVersion {
  id: string;
  label: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Scope {
  id: string;
  caseNumber: string;
  status: "Draft" | "In Review" | "Approved";
  confidence: number;
  versions: ScopeVersion[];
  sections: ScopeSection[];
}

export interface ValidationResult {
  verdict: ValidationVerdict;
  confidence: number;
  matchedBomItems: string[];
  missingBomItems: string[];
  reviewerNotes: string[];
}

export interface WeatherSignal {
  summary: string;
  temperatureF: number;
  severeRisk: "Low" | "Moderate" | "High";
}

export interface TrafficSignal {
  etaMinutes: number;
  routeRisk: "Low" | "Moderate" | "High";
  leaveBy: string;
}

export interface SignalMatch {
  ruleId: string;
  category: string;
  matchedText: string[];
  confidence: number;
}

export interface ActionRecommendation {
  owner?: string;
  nextStep?: string;
  dueDateTrigger?: boolean;
}

export interface NoteAnalysisResult {
  summary: string;
  categories: string[];
  flags: {
    partsRelated: boolean;
    shipmentMentioned: boolean;
    approvalNeeded: boolean;
    schedulingNeeded: boolean;
    remoteSupportSuggested: boolean;
    vendorFollowupSuggested: boolean;
    repeatDispatchRisk: boolean;
  };
  skillSignals: SkillSignal[];
  ownerSuggestion?: string;
  nextStepSuggestion?: string;
  dueDateTrigger?: boolean;
  matchedRules: string[];
}

export interface KeywordRule {
  id: string;
  pattern: string;
  category: string | null;
  ownerOverride?: string | null;
  stepTextOverride?: string | null;
  dueDateTrigger?: boolean | null;
  outputFlags?: string[];
  skillTags?: SkillSignal[];
  priority?: number;
}

export interface CaseSignal {
  type:
    | "Approval Needed"
    | "Awaiting Client"
    | "Parts In Play"
    | "Vendor Follow-Up"
    | "Remote Support Needed"
    | "Repeat Dispatch"
    | "Scope Risk"
    | "Out Of Scope Risk";
  severity: SignalSeverity;
  skillTags: SkillSignal[];
  recommendation?: ActionRecommendation;
  matches: SignalMatch[];
}

export interface WorkOrderSignal {
  type:
    | "Scheduled"
    | "Onsite Complete"
    | "Return Visit Needed"
    | "Parts Delivered"
    | "Testing Required"
    | "Escalate Tier 3"
    | "Remote Support"
    | "Assignment Risk";
  severity: SignalSeverity;
  skillTags: SkillSignal[];
  recommendation?: ActionRecommendation;
  matches: SignalMatch[];
}

export interface ServiceCase {
  id: string;
  caseNumber: string;
  state: string;
  priority: string;
  shortDescription: string;
  assignmentGroup?: string;
  accountName: string;
  contractId?: string;
  entitlementName?: string;
  client: Client;
  site: Site;
  primaryContact?: Contact;
  commentsAndWorkNotesRaw: string;
  analysis?: NoteAnalysisResult;
  caseSignals: CaseSignal[];
  openWorkOrderIds: string[];
  workOrderIds: string[];
  scope?: Scope;
  validation?: ValidationResult;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  caseNumber: string;
  state: string;
  scheduledStart?: string;
  assignmentGroup?: string;
  assignedTo?: string;
  laborSource?: "Internal" | "Subcontractor";
  visitPurpose?: string;
  workOrderWorkNotesRaw: string;
  analysis?: NoteAnalysisResult;
  workOrderSignals: WorkOrderSignal[];
  technicianIds: string[];
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
}

export interface CaseRollup {
  caseNumber: string;
  totalWorkOrders: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  repeatVisitCount: number;
  hasRepeatDispatch: boolean;
  latestWorkOrderNumber?: string;
  latestScheduledStart?: string;
  latestCaseSignalTypes: string[];
  latestWorkOrderSignalTypes: string[];
}

export interface WeeklyDispatchCard {
  workOrderNumber: string;
  caseNumber: string;
  siteName: string;
  city: string;
  state: string;
  scheduledStart?: string;
  assignedTo?: string;
  shortDescription: string;
  flagSummary: string[];
  nextStep?: string;
  skillTags: SkillSignal[];
  weather?: WeatherSignal;
  weatherSource?: "weather.gov" | "fallback";
}

export interface WeeklyDispatchBoardCell {
  date: string;
  workOrders: WeeklyDispatchCard[];
}

export interface WeeklyDispatchBoardRow {
  clientName: string;
  region: string;
  siteCount: number;
  uniqueCaseCount: number;
  weeklyWorkOrderCount: number;
  repeatDispatchCaseCount: number;
  flagSummary: string[];
  nextStepOwners: string[];
  days: Record<string, WeeklyDispatchBoardCell>;
}

export interface DispatchRecord {
  id: string;
  caseNumber: string;
  projectName: string;
  visitPurpose: string;
  visitDate: string;
  status: DispatchStatus;
  urgency: "Low" | "Medium" | "High";
  laborSource: "Internal" | "Subcontractor";
  region: string;
  supervisor: string;
  assignedTechIds: string[];
  blockers: string[];
  notes: string[];
  client: Client;
  site: Site;
  weather: WeatherSignal;
  traffic: TrafficSignal;
  scope: Scope;
  validation: ValidationResult;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  phase: string;
  soldScopeSummary: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  tone: "default" | "positive" | "warning" | "danger";
}

export interface QueueItem {
  id: string;
  title: string;
  description: string;
  count: number;
}

