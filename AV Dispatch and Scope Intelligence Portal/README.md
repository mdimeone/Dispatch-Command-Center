# AV Dispatch & Scope Intelligence Portal

A modern, full-stack dispatch and scope-management application for AV field service teams.

This project is the next-generation evolution of the current Python/Dash-based service analytics dashboard. It serves the same operational purpose — dispatch visibility, scope creation, workload awareness, and service planning — but is reimagined as a **feature-rich, enterprise-ready web application** built with **Next.js**, **React**, and a modular data/API architecture.

The short-term goal is to deploy and iterate quickly on **Railway**. The long-term goal is to align with the company’s application stack and transition the app behind **Microsoft Entra ID (Azure AD) SSO** and into the broader enterprise data environment.

This README is intended to define the project vision, architecture, and implementation direction from day one.

---

## 1. Project Vision

Build a highly polished internal dispatch portal that helps supervisors, coordinators, and service leadership:

- View and manage upcoming onsite work
- Generate, review, and refine scopes of work
- Compare proposed scope against original project intent
- Surface staffing, logistics, weather, and route-risk signals
- Use AI to accelerate drafting and quality checks
- Trigger automation based on workflow changes
- Start with Excel-backed data, but transition cleanly to enterprise APIs and data services later

This app should be:

- **Fast**
- **Modern**
- **Highly visual**
- **Mobile-friendly where practical**
- **Operationally useful on day one**
- **Architected for future enterprise migration**

---

## 2. Core Objectives

### Phase 1: Prototype / Railway
- Build the application in **Next.js + React + TypeScript**
- Host on **Railway**
- Use **Excel** as the temporary source of truth
- Provide a strong UI for dispatch visibility and scope generation
- Expose internal API routes for data access, AI actions, and validation workflows
- Create a clean repository structure and README-driven implementation plan

### Phase 2: Operational Expansion
- Add richer workflow states, approvals, and automation triggers
- Add AI-assisted scope drafting and scope review
- Add BOM-aware comparisons against original project intent
- Add weather and traffic intelligence for dispatch planning
- Improve auditability, comments, revision history, and notifications

### Phase 3: Enterprise Transition
- Replace temporary auth with **Microsoft Entra ID / Azure SSO**
- Replace Excel-backed data with enterprise APIs or a data platform layer
- Integrate against company systems, data lake feeds, and/or governed service APIs
- Move hosting and secrets management into the organization’s preferred Azure environment

---

## 3. Product Direction

This should not be treated as a simple form app or spreadsheet wrapper.

The target experience is an internal operations platform with a high-end UI and deeply helpful workflow features. The app should “pull out all the stops” in terms of usability and capability.

### Design goals
- Intuitive navigation
- Low-friction data entry
- Strong visual hierarchy
- Quick filtering and searching
- Rich detail panels and side drawers
- Helpful badges, warnings, and confidence indicators
- AI assistance embedded where it saves time
- Clean handoff between dispatch, scope creation, review, and follow-up

---

## 4. Proposed Feature Set

## 4.1 Dispatch Portal
Core dispatch-focused views:

- Daily dispatch board
- Weekly dispatch board
- Supervisor workload dashboard
- Technician schedule view
- Client / site visit queue
- Case detail panel
- Open actions / follow-up queue
- Needs-attention queue
- Scope-required queue

### Dispatch features
- Search by case number, client, site, city, state, technician, or project
- Filter by status, region, visit type, labor source, supervisor, or customer
- Color-coded urgency/status indicators
- Dispatch cards with site, visit date, assigned staff, visit purpose, and blockers
- Expandable visit history timeline
- Notes, comments, and internal coordination prompts
- Travel context widgets for weather and traffic risk
- Rapid-access action buttons:
  - Build Scope
  - Review Scope
  - Check BOM alignment
  - Add internal note
  - Mark ready for dispatch
  - Flag risk
  - Escalate

## 4.2 Scope of Work Builder
The original Python/Dash application (`av_supervisor_dashboard.py`) includes a production-ready Scope of Work Generator. The Next.js implementation should preserve this proven workflow while expanding capability.

### Current scope generator behavior (from the original Python app)
- Route and UX: The builder is exposed at `/scope-builder` as a dedicated two-column workspace with guided sections for Case Details, Scope Guidance, Contacts/Staffing, and Generated Scope preview.
- Case prefill: Entering a case number attempts lookup against case and dispatch datasets to auto-fill client and site. Exact matches are preferred; partial matching is intentionally limited to avoid ambiguous numeric case IDs.
- Case-to-builder shortcuts: The Cases board and Case Detail page both include a direct `Scope builder` action so supervisors can jump to drafting without losing workflow context.
- Context handoff behavior: Opening scope builder from a case passes key case fields via URL query params (case number, client, site, city/state, address, and contact details) and pre-populates the form on load.
- Structured input model: The form captures schedule, complexity, technician count, site/contact details, staffing ownership, labor-partner details, internal actions, remote support, special tools, Tier 2 notes, and previous-visit context.
- Conditional prompts: Follow-up fields are hidden or shown based on answers (for example staffing mode, internal actions yes/no, remote support yes/no). This keeps the workflow concise while still collecting complete scope context.
- Rich text work scope entry: The Work Scope body accepts formatted input (bold, bullets, numbered lists, links). HTML is sanitized and converted into safe markdown/plain-text output for preview and export.
- Live generation pipeline: Every relevant field change rebuilds a structured scope preview in real time and updates summary banners (visit/staffing summary and internal-actions alert).
- Output structure: Generated scope content is assembled into consistent sections:
  - Overview
  - Staffing Plan
  - Onsite Contact
  - Special Tools Required (conditional)
  - Work Scope
  - Remote Support (conditional)
  - Tier 2 Notes (conditional)
  - Previous Visit Context (conditional)
  - Closeout Expectations
- Export behavior: Users can download the generated scope as `.doc` or `.txt`, with case-based filename normalization.

### Scope builder migration guidance
- Preserve the same conditional field logic and section ordering so operations users get familiar, predictable output.
- Keep case-number lookup and client/site prefill behavior aligned with legacy matching rules.
- Maintain rich-text-safe handling for scope body input so formatting survives preview/export without unsafe HTML.
- Add AI drafting/rewrite and approval workflow as additive layers on top of this baseline generator, not as a replacement for core structured scope capture.

### 4.2.1 Location-Based Labor Provider + Internal Utilization
Add a labor sourcing panel in the scope builder that responds to the selected service location.

Current implementation target (pre-SharePoint):
- Data source for labor providers: Excel file at `./data/current/labor_provider_directory.xlsx`
- Purpose: when site/city/state is filled in, show matching labor provider vendors for that geography
- Manual setup now: populate this workbook directly with a small starter vendor list before feature build

Future source:
- Replace the labor provider Excel source with a SharePoint list-backed connector
- Keep the same normalized API contract so UI behavior does not change when source changes

Internal technician utilization:
- Add a secondary source that checks internal technician availability/utilization
- Primary future source: internal scheduling database/service
- Interim option: Excel mirror at `./data/current/internal_technician_schedule.xlsx`
- Behavior goal: when project technician utilization is low, surface internal technicians as recommended staffing options before escalating to labor partners

## 4.3 AI Integration
AI should be a first-class capability, not an afterthought.

### AI-assisted use cases
- Draft scope from case details + prior notes
- Expand technician shorthand into polished scope language
- Rewrite text for tone and clarity
- Summarize previous visits
- Identify missing information before dispatch
- Compare current scope to original project scope/BOM
- Flag possible scope creep
- Suggest out-of-scope language
- Generate internal review notes
- Generate client-facing and internal versions from the same inputs
- Score scope completeness/confidence
- Classify the visit type automatically

### AI trigger concepts
The system should support API-driven AI actions when:
- a case changes to a target status
- a dispatch item is marked ready for scope
- a scope is saved
- a scope is submitted for review
- a BOM comparison request is initiated
- a technician update or intake form provides new structured input
- a field is changed that materially alters scope intent

### AI output examples
- Drafted scope text
- Alignment score vs original scope/BOM
- Missing-data checklist
- Scope creep warning
- Suggested staffing edits
- Suggested customer-facing phrasing
- Suggested internal escalation note

---

## 5. Scope-to-Project Validation

A major feature of this new system is determining whether the current scope aligns with the original intended project scope.

### Current-state concept
For now, the original project context may come from:
- Excel-based BOM exports
- Excel sheets with product/line-item detail
- Manually maintained scope-reference tabs
- Prior scope text stored in the app

### Future-state concept
Later, the comparison source may come from:
- a project database
- a data lake-backed service
- ERP / quoting / implementation system APIs
- project repository data exposed via enterprise APIs

### Validation goals
- Determine whether the requested work appears aligned with original sold scope
- Flag likely out-of-scope asks
- Identify references to equipment not present in the BOM
- Surface missing dependencies or assumptions
- Highlight likely follow-up questions for the case manager

### Validation output ideas
- Aligned / Possibly Aligned / Likely Out of Scope
- Confidence score
- Referenced BOM items found / not found
- Suggested reviewer notes
- Suggested customer-safe language
- Required approvals if scope is likely expanded beyond original intent

---

## 6. Data Strategy

## 6.1 Temporary Data Layer
The initial version may use Excel as a temporary operational data source.

Possible source files:
- dispatch workbook
- case workbook
- detail sheet exports
- BOM workbook
- staffing / technician reference sheet
- labor provider directory workbook (`./data/current/labor_provider_directory.xlsx`)
- internal technician schedule workbook (`./data/current/internal_technician_schedule.xlsx`)
- project reference workbook

### Excel usage rules
- Treat Excel as a temporary repository, not the long-term system design
- Prefer a service layer that reads/parses Excel and returns normalized objects
- Avoid tightly coupling UI code to workbook structure
- Support controlled uploads or admin-managed file replacement
- Preserve flexibility for mapping columns and sheets as formats evolve

## 6.2 Future Data Layer
The application should later swap Excel readers for:
- enterprise APIs
- database queries
- governed integration services
- data lake-derived endpoints

### Architecture principle
The UI should ask a data service for records such as:
- dispatches
- cases
- scopes
- BOM references
- technicians
- projects

The UI should **not** care whether the source is Excel, SQL, or an enterprise API.

---

## 7. Recommended Tech Stack

## 7.1 Frontend
- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- Component library to be determined (recommended: shadcn/ui or equivalent)
- Charting library to be determined
- Table/grid library to be determined for large operational datasets

## 7.2 Backend / Server Layer
- Next.js server routes / route handlers
- Server-side actions for protected workflows
- API routes for:
  - dispatch retrieval
  - scope generation
  - BOM comparison
  - AI prompting
  - weather lookup
  - traffic lookup
  - workflow triggers
  - exports

## 7.3 Hosting / Delivery
### Short term
- **Railway**
- GitHub-connected deployment
- environment variables for keys and config

### Long term
- Azure-hosted deployment model to be determined
- Microsoft Entra ID SSO
- enterprise secrets/configuration management
- enterprise data connectivity

## 7.4 Authentication
### Early phase options
- no auth for local-only development
- simple protected access for prototype review
- light credentials / access gate if needed

### Long term
- Microsoft Entra ID / company SSO
- role-aware access controls for supervisors, managers, admins, and reviewers

---

## 8. External Intelligence Integrations

The UI should support contextual operational intelligence.

## 8.1 Weather
Use a weather provider to surface:
- current conditions
- day-of forecast
- arrival-window forecast
- severe weather risk
- precipitation and temperature context for field work

Potential use in UI:
- dispatch card weather badge
- site-risk callout
- travel/advisory section in visit detail panel

## 8.2 Traffic / ETA
Use mapping/route APIs to surface:
- drive time from tech home base or office
- current traffic-aware ETA
- projected travel time for selected departure windows
- incident warnings
- route-risk flags

Potential use in UI:
- dispatch prioritization
- technician assignment support
- site arrival planning
- “leave by” recommendations

---

## 9. Workflow Automation Concepts

This app should support both user-initiated and event-driven automation.

### Example triggers
- status changed to “Needs Scope”
- visit date added or updated
- site marked high-risk
- new BOM uploaded
- scope saved without required fields
- scope submitted for approval
- reviewer flags out-of-scope risk
- technician note indicates major variance from plan

### Example automated actions
- generate draft scope
- request BOM comparison
- notify reviewer
- update confidence status
- create follow-up task
- mark dispatch item as blocked pending clarification
- log AI-generated recommendation for human review

### Important principle
Automation should assist humans, not silently replace review in high-impact workflows.

---

## 10. Suggested Information Architecture

## Primary navigation
- Dashboard
- Dispatch Board
- Cases
- Scope Builder
- Scope Review
- BOM Validation
- Projects
- Reports
- Admin

## Example screen patterns
- Dashboard with KPI cards + alerts + work queues
- Data grid with saved filters
- Detail drawer for rapid review without leaving context
- Split pane view for case + scope
- Timeline and activity feed
- AI suggestion side panel
- Validation panel with confidence/risk indicators

---

## 11. Suggested Repository Structure

```text
av-dispatch-scope-portal/
├─ README.md
├─ package.json
├─ next.config.ts
├─ tsconfig.json
├─ .env.example
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ (dashboard)/
│  │  ├─ api/
│  │  │  ├─ dispatch/
│  │  │  ├─ scopes/
│  │  │  ├─ validation/
│  │  │  ├─ ai/
│  │  │  ├─ traffic/
│  │  │  └─ weather/
│  │  ├─ scope-builder/
│  │  ├─ dispatch-board/
│  │  ├─ projects/
│  │  └─ admin/
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ dashboard/
│  │  ├─ dispatch/
│  │  ├─ scopes/
│  │  ├─ validation/
│  │  └─ shared/
│  ├─ lib/
│  │  ├─ excel/
│  │  ├─ data/
│  │  ├─ ai/
│  │  ├─ auth/
│  │  ├─ validation/
│  │  ├─ traffic/
│  │  ├─ weather/
│  │  └─ utils/
│  ├─ types/
│  └─ styles/
├─ data/
│  ├─ current/
│  └─ samples/
└─ docs/
   ├─ architecture/
   ├─ prompts/
   └─ decisions/
```

---

## 12. Suggested Domain Model

Examples of entities to define early:

- Dispatch
- Visit
- Case
- Site
- Client
- Technician
- Supervisor
- Scope
- ScopeVersion
- Project
- BOMLine
- ValidationResult
- AutomationEvent
- AIJob
- Comment
- Attachment

These should be normalized in TypeScript interfaces so the app remains stable even if source files change.

---

## 13. API Direction

Design internal APIs around business actions, not file structure.

### Example endpoints
- `GET /api/dispatch`
- `GET /api/dispatch/:id`
- `GET /api/cases/:caseNumber`
- `POST /api/scopes/generate`
- `POST /api/scopes/rewrite`
- `POST /api/scopes/validate`
- `POST /api/scopes/compare-to-bom`
- `POST /api/automation/trigger`
- `GET /api/weather`
- `GET /api/traffic`
- `POST /api/uploads/excel`

### API design principles
- normalize responses
- log important actions
- expose confidence and warnings clearly
- return reviewable output, not black-box decisions
- keep AI prompts and orchestration modular

---

## 14. AI Guardrails

AI can accelerate workflow, but the application should be designed with review and traceability in mind.

### Principles
- Human review remains in the loop for important scope decisions
- AI suggestions should be labeled clearly
- Inputs used to generate or validate a scope should be traceable
- Confidence should never be presented as certainty
- Scope-vs-BOM mismatch results should be reviewable and explainable
- Prompt templates should be versioned where practical

### High-value guardrail ideas
- Require approval for “Likely Out of Scope” determinations before finalizing customer-facing language
- Save AI source context used for major generated outputs
- Distinguish between generated draft language and approved final language
- Log trigger source for automated AI runs

---

## 15. Environment Variables

Initial examples:

```bash
# App
NODE_ENV=development
PORT=3000

# Data
DATA_SOURCE=excel
EXCEL_DISPATCH_FILE=./data/current/dispatch.xlsx
EXCEL_BOM_FILE=./data/current/bom.xlsx
EXCEL_LABOR_PROVIDER_FILE=./data/current/labor_provider_directory.xlsx
EXCEL_INTERNAL_TECH_SCHEDULE_FILE=./data/current/internal_technician_schedule.xlsx

# Auth
AUTH_MODE=local

# AI
OPENAI_API_KEY=your_key_here
AI_MODEL=to_be_determined

# External intelligence
WEATHER_API_KEY=your_key_here
TRAFFIC_API_KEY=your_key_here

# App behavior
APP_TIMEZONE=America/New_York
```

Add, remove, or rename these as architecture decisions are finalized.

---

## 16. Local Development Goals

Initial local workflow should be simple:

1. Clone repo
2. Install dependencies
3. Add `.env.local`
4. Provide sample Excel files
5. Run development server
6. Begin building feature slices incrementally

Example starter flow:

```bash
npm install
npm run dev
```

---

## 17. Railway Deployment Goals

The initial Railway deployment should support:
- fast iteration
- simple environment variable management
- easy prototype demo access
- support for temporary file-backed workflows
- clean transition to future managed services

### Early deployment notes
- Keep sensitive production data out of the repo
- Use environment variables for API keys and settings
- If writable files are needed, handle that intentionally
- Prefer sample or sanitized workbooks in development/demo environments

---

## 18. Recommended Build Sequence

## Foundation
1. Create Next.js project with TypeScript and styling setup
2. Define core layout and navigation
3. Build data service abstraction
4. Add Excel ingestion/parsing layer
5. Create initial dashboard + dispatch board

## Scope workflow
6. Build scope builder shell
7. Add structured scope sections and editor
8. Add save/load/version pattern
9. Add AI draft generation endpoints
10. Add scope review experience

## Validation workflow
11. Add BOM ingestion model
12. Add scope-to-BOM comparison service
13. Add validation UI with confidence and reviewer notes

## Intelligence workflow
14. Add weather integration
15. Add traffic/ETA integration
16. Add dispatch risk indicators

## Automation workflow
17. Add trigger/event model
18. Add automated AI actions for selected workflow events
19. Add action logging and audit visibility

## Enterprise readiness
20. Prepare auth abstraction for future SSO
21. Refactor data connectors toward enterprise APIs
22. Document migration path to Azure/tenant-hosted deployment

---

## 19. Definition of Success

This application is successful when it:
- materially improves dispatch visibility
- reduces time required to create scopes
- improves scope consistency and completeness
- helps identify likely out-of-scope asks earlier
- provides better operational awareness around staffing, travel, and risk
- supports a smooth migration path from prototype to enterprise platform

---

## 20. Relationship to the Current Python/Dash App

This project replaces the architecture of the existing dashboard while preserving its business purpose.

The current Python-based project focuses on:
- dashboarding
- dispatch visibility
- scope generation
- Excel-backed workflows

The new project should preserve those core operational outcomes while dramatically improving:
- UI/UX
- modularity
- maintainability
- extensibility
- AI integration
- automation support
- enterprise readiness

The existing README and app served as a strong operational baseline for what the tool needs to do. This new app uses that same mission as its foundation while redesigning the implementation around a modern full-stack application model. Source inspiration: fileciteturn0file0

---

## 21. Immediate Next Deliverables

Recommended first project artifacts:
- `README.md`
- initial repository scaffold
- architecture notes
- sample domain types
- data mapping notes for existing Excel sources
- first-pass wireframe / route map
- AI prompt strategy notes
- event/trigger model draft

---

## 22. Notes for Future Iteration

As implementation begins, this README should evolve to include:
- actual package choices
- setup instructions
- exact environment variables
- authentication approach
- selected AI provider/model details
- actual data contracts
- deployment specifics
- screenshots and workflow examples

This document should be treated as the product and architecture starting point, not the final specification.

