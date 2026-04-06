# Case and Work Order Domain Model

## Why this model changes

The current prototype uses a flat `DispatchRecord` for convenience, but the real operating model is not flat.

- A `Case` is the master service problem.
- A `Work Order` is a specific onsite visit created to address that case.
- One `Case` can have many `Work Orders`.
- A case may remain open across multiple onsite visits until the issue is resolved.

This distinction should become the foundation of the app's normalized data model before Excel parsing and future API integrations are expanded.

## Core relationship

```text
Account / Client
  -> Site
    -> Case
      -> Work Order 1
      -> Work Order 2
      -> Work Order 3
      -> Scope
      -> Validation
      -> Case-level signals
```

## Modeling principles

- Model `Case` and `WorkOrder` as separate entities.
- Use `Case` as the parent record for issue history, contact context, entitlement, and long-running problem status.
- Use `WorkOrder` as the child record for scheduling, staffing, onsite execution, and visit-specific notes.
- Preserve both identifiers everywhere a visit is shown: `workOrderNumber` and `caseNumber`.
- Keep note analysis separate by level:
  - case-level note stream from `Comments and Work notes`
  - work-order-level note stream from `Work Order Work Notes`
- Derive rollups from relationships rather than duplicating state onto every child record.

## Recommended entity model

### Shared supporting entities

```ts
export interface Client {
  id: string;
  name: string;
  segment: string;
}

export interface SiteAddress {
  street: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
}

export interface Site {
  id: string;
  name: string;
  timezone: string;
  address: SiteAddress;
  accessNotes: string[];
}

export interface Contact {
  name: string;
  email?: string;
  mobilePhone?: string;
  businessPhone?: string;
}
```

### Case

The case is the master issue record and should hold all cross-visit context.

```ts
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
  caseSignals: CaseSignal[];
  openWorkOrderIds: string[];
  workOrderIds: string[];
  scope?: Scope;
  validation?: ValidationResult;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
}
```

### Work Order

The work order is the specific onsite execution record.

```ts
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
  workOrderSignals: WorkOrderSignal[];
  technicianIds: string[];
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
}
```

## Signal model

Signals should be structured outputs from the enrichment pipeline, not just free-text labels.

### Shared signal shape

```ts
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
```

### Case-level signals

Use these when the note history reflects the overall issue lifecycle.

```ts
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
  severity: "Info" | "Warning" | "Action Needed" | "Blocked";
  skillTags: string[];
  recommendation?: ActionRecommendation;
  matches: SignalMatch[];
}
```

### Work-order-level signals

Use these when the note history reflects a specific visit or dispatch action.

```ts
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
  severity: "Info" | "Warning" | "Action Needed" | "Blocked";
  skillTags: string[];
  recommendation?: ActionRecommendation;
  matches: SignalMatch[];
}
```

## Derived rollups

The board and KPI views should rely on derived rollups rather than flattening case and work-order state together.

### Case rollup

```ts
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
```

### Weekly board row

This represents the client/site-oriented row used in the weekly dispatch board.

```ts
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

export interface WeeklyDispatchBoardCell {
  date: string;
  workOrders: WeeklyDispatchCard[];
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
  skillTags: string[];
}
```

## Source-to-model guidance

### Case-level source fields

These should map onto `ServiceCase`:

- `Case Number`
- `Case State`
- `Case Assignment Group`
- `Account`
- `Site Name`
- `Case Short Description`
- `Street`
- `City`
- `State / Province`
- `Zip / Postal Code`
- `Country`
- `Priority`
- `Name`
- `Email`
- `Mobile phone`
- `Business phone`
- `Contract`
- `Entitlement`
- `Comments and Work notes`

### Work-order-level source fields

These should map onto `WorkOrder`:

- `Work Order Number`
- `Work Order State`
- `Work Order Scheduled Start`
- `Work Order Work Notes`
- `Work Order Assignment Group`
- `Work Order Assigned To`
- `Case Number`

## Enrichment guidance

The enrichment pipeline should operate in two passes:

1. Work-order pass
   - analyze `Work Order Work Notes`
   - create visit-specific signals
   - infer assignment, testing, return-visit, or shipment status tied to a visit

2. Case pass
   - analyze `Comments and Work notes`
   - create case-level signals
   - detect broader issue lifecycle patterns such as approvals, vendor waits, and repeated dispatches

Then create a final rollup:

- surface current next step
- surface recommended owner
- determine whether the case is a repeat-dispatch problem
- expose weekly board flags

## UI implications

### Weekly dispatch board

- The board should display `WorkOrder` cards because those are the scheduled onsite events.
- Each card should show both the work order number and the case number.
- Row summaries should include:
  - weekly work order count
  - unique case count
  - unique site count
  - repeat dispatch count
  - active flags

### Case detail view

- Show case-level metadata and latest signals at the top.
- Show a timeline of all work orders for the case.
- Show separated note history:
  - case comments/history
  - work-order visit history
- Show whether the current dispatch is the first visit or a return visit.

### Scope builder

- Scope should remain attached to the `Case`.
- The current or next `WorkOrder` should provide visit timing and staffing context.
- AI drafting should use both:
  - case-level problem history
  - most recent work-order execution history

## Migration guidance for the current prototype

The current `DispatchRecord` can remain temporarily as a view model, but it should become a derived composition rather than the core domain entity.

Recommended migration order:

1. Introduce `ServiceCase` and `WorkOrder` types in `src/types/domain.ts`.
2. Update the Excel parser to emit case and work-order collections.
3. Add note-enrichment output types for case and work-order signals.
4. Build repository functions that assemble board-ready and detail-ready view models.
5. Refactor the dispatch board to consume weekly board rows and work-order cards.
6. Retire or minimize `DispatchRecord` once the board and case views are using the new model.

## Important cautions

- Do not collapse case and work-order notes into a single raw field.
- Do not use a work-order state as the case state.
- Do not assume one work order per case.
- Do not make the weekly board case-centric if the user is scheduling onsite work; the board should stay work-order-centric with case awareness layered in.
