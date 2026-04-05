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
