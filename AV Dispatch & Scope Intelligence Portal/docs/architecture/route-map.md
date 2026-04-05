# Route Map

- `/dashboard`: KPI snapshot, priority queue, and featured dispatches
- `/dispatch-board`: board/table view of upcoming onsite work
- `/cases`: compact case and visit history queue
- `/scope-builder`: structured scope drafting starter experience
- `/scope-review`: supervisor and reviewer queue
- `/bom-validation`: explainable alignment results
- `/projects`: sold-scope/project reference view
- `/reports`: prototype metrics and workload reporting
- `/admin`: connector, AI policy, and automation placeholder

## Internal API starter routes

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
