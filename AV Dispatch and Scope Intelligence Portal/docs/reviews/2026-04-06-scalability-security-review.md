# AV Dispatch & Scope Portal Review

Date: 2026-04-06

Scope: full-codebase review focused on completeness, security, scalability, maintainability, and onboarding-readability for the next developer.

## Executive Summary

The project is in a strong prototype state: the UI is coherent, the domain model is directionally good, the Excel parsing layer is separated from the UI, and the app already has a basic shared-login gate. The main gap is that the codebase still behaves like a prototype in several critical areas:

- authentication is suitable for demos, not for production or multi-user operation
- API routes expose broad internal data without input validation, rate limiting, or audit controls
- the repository layer is a large monolith with eager module-level loading and mixed responsibilities
- there is no test suite, no CI enforcement, and no operational observability
- several routes and provider integrations are scaffolds, which is fine for now, but they need formal contracts before more developers build on top of them

The code is readable enough for a prototype, but it needs stronger boundaries and clearer service ownership before this becomes safe to scale.

## Priority Findings

### Critical

#### 1. Shared-login session model is not production-safe

Files:

- `middleware.ts`
- `src/lib/auth.ts`
- `src/app/login/actions.ts`

Why this matters:

- The session cookie value is the same static secret for every user and every session.
- There is no per-session identifier, no rotation, no invalidation list, no user identity, and no audit trail.
- The shared password is compared directly against an environment variable and does not support rate limiting, lockout, or brute-force protection.

What needs to be done:

- Replace the static cookie token with signed or encrypted per-session tokens.
- Move to a real auth provider before production: Microsoft Entra ID is the intended long-term path.
- Until then, use hashed credentials, per-session identifiers, expiration metadata, and server-side session storage.
- Add login attempt throttling and lockout behavior.
- Add explicit auth event logging for login success, failure, and logout.

#### 2. API surface exposes internal operational and potentially sensitive data with no validation or authorization tiers

Files:

- `src/app/api/dispatch/route.ts`
- `src/app/api/dispatch/[id]/route.ts`
- `src/app/api/cases/[caseNumber]/route.ts`
- `src/app/api/weather/route.ts`

Why this matters:

- The API returns rich case and dispatch payloads directly from the repository with no field-level shaping for least privilege.
- The weather endpoint can enumerate all dispatches and externalize site/city/state/case metadata in one call.
- There is no role-based authorization, response minimization, request validation, or audit boundary between UI usage and API usage.

What needs to be done:

- Introduce DTOs per route instead of returning repository objects directly.
- Separate internal domain models from external API response contracts.
- Add input validation for all route params and query strings.
- Add role-aware authorization checks before route execution.
- Add pagination, filtering, and explicit scopes for bulk endpoints.
- Add structured audit logging for high-value API access.

#### 3. No automated tests or CI quality gate exist

Files:

- `package.json`

Why this matters:

- The project currently relies on manual verification plus `tsc --noEmit`.
- There are no unit, integration, route, parsing, or UI tests.
- There is no CI pipeline enforcing typecheck, lint, test, or build on every change.

What needs to be done:

- Add a test stack:
  - unit tests for analyzers, parsers, mapping helpers, auth helpers
  - integration tests for route handlers
  - component tests for critical UI slices
  - end-to-end smoke tests for login and key workflows
- Add CI to run:
  - install
  - typecheck
  - lint
  - test
  - production build
- Block merges when required checks fail.

### High

#### 4. Repository layer centralizes too many responsibilities and uses eager module-scope loading

Files:

- `src/lib/data/repository.ts`

Why this matters:

- The module handles source loading, normalization, derived metrics, board composition, and weather-enriched board shaping in one file.
- Workbook parsing runs at module initialization time, so startup cost and data freshness are coupled to process lifecycle.
- Shared in-memory collections are reused across calls, which is workable for a prototype but brittle as refresh patterns and data volume grow.
- Tight coupling in one module increases onboarding friction and makes isolated testing harder.

What needs to be done:

- Split the repository into focused modules:
  - source loading
  - normalization/mapping
  - derived business services
  - board/query services
  - external enrichment services
- Move eager module initialization into explicit service functions or cached loaders with clear invalidation rules.
- Introduce query functions that accept typed filters instead of exposing whole in-memory collections everywhere.
- Add dedicated files for:
  - `dispatch-service`
  - `case-service`
  - `validation-service`
  - `board-service`
  - `metrics-service`

#### 5. Weather enrichment has useful baseline caching, but fan-out can still become a scaling bottleneck

Files:

- `src/app/api/weather/route.ts`
- `src/lib/data/repository.ts`
- `src/lib/weather/provider.ts`

Why this matters:

- The weather route can still fan out across many dispatches in one request.
- The weekly dispatch board weather snapshot enriches multiple work orders asynchronously each time it is built.
- There is already some caching (`coordinateCache` in-memory plus `fetch(..., { next: { revalidate: 1800 } })`), but it is process-local and does not provide global concurrency control or cross-instance durability.
- External provider latency and burst limits can still directly affect response times when many lookups are triggered together.

What needs to be done:

- Add bounded concurrency for geocoding and weather fetches.
- Deduplicate lookups per request by normalized site/coordinate keys before calling providers.
- Introduce a shared cache (for example Redis) with TTL and stale-while-revalidate behavior for multi-instance deployments.
- Persist weather snapshots for board views that are read frequently.
- Consider scheduled enrichment for bulk/board scenarios rather than full synchronous enrichment on demand.
- Add rate-limit awareness, circuit-breaker behavior, and telemetry for cache hit rate, provider latency, and fallback frequency.

#### 6. Middleware auth is broad but incomplete as a long-term access-control strategy

Files:

- `middleware.ts`
- `src/lib/auth.ts`

Why this matters:

- It protects the app from anonymous access, which is good.
- It does not support roles, path-level permissions, API policy exemptions, operational service accounts, or future admin-only surfaces.
- Everything authenticated currently has access to everything.

What needs to be done:

- Add an authorization model separate from authentication.
- Define roles early:
  - dispatcher
  - reviewer
  - admin
  - read-only leadership
- Add route-policy helpers so role checks are centralized.
- Plan a clean migration path from shared password to SSO without rewriting route protection from scratch.

#### 7. Request validation and error handling are too light across the API layer

Files:

- `src/app/api/scopes/generate/route.ts`
- `src/app/api/scopes/rewrite/route.ts`
- `src/app/api/scopes/validate/route.ts`
- `src/app/api/scopes/compare-to-bom/route.ts`
- `src/app/api/automation/trigger/route.ts`
- `src/app/api/weather/route.ts`

Why this matters:

- Most handlers accept arbitrary JSON and echo it back or use it loosely.
- There are no schema validators, no request size limits, and no typed error envelopes.
- The current behavior is acceptable for scaffolding but not safe for production use.

What needs to be done:

- Add request and response schemas for every route.
- Standardize route error responses.
- Add a reusable validation helper.
- Add defensive limits:
  - maximum payload size
  - allowed fields
  - required fields
  - enum validation
- Add explicit content-type expectations.

### Medium

#### 8. Logout over GET is acceptable for a prototype but should move to POST

Files:

- `src/app/logout/route.ts`
- `src/components/shared/app-shell.tsx`

Why this matters:

- GET-based logout is easy but can be triggered by prefetching or cross-site request patterns.
- It is low risk compared to login, but still not ideal.

What needs to be done:

- Change logout to a POST action or server action.
- Disable accidental prefetching if needed.
- Add CSRF-aware patterns once non-trivial mutations exist.

#### 9. Build and dependency strategy is too loose for a stable team workflow

Files:

- `package.json`

Why this matters:

- `next`, `react`, and `react-dom` use `"latest"`, which makes installs non-deterministic over time.
- This increases onboarding friction and regression risk.

What needs to be done:

- Pin framework versions intentionally.
- Adopt a dependency update policy.
- Add automated dependency scanning.
- Capture supported Node and npm versions in the README or an `.nvmrc`/tooling config.

#### 10. Excel ingestion is still too implicit for safe production use

Files:

- `src/lib/excel/work-orders-open-cases-source.ts`
- `src/lib/excel/work-orders-open-cases-parser.ts`

Why this matters:

- Column aliasing is practical, but schema drift is still handled informally.
- Parsing failures fall back to sample data in some cases, which is helpful in development but risky in production because it can hide bad source conditions.

What needs to be done:

- Separate development fallback behavior from production behavior.
- Surface ingestion errors explicitly.
- Add file-level validation reports.
- Add workbook versioning and schema checks.
- Add tests against realistic sample workbooks.
- Document required columns and error-handling expectations.

#### 11. Domain naming and data ownership boundaries need clarification

Files:

- `src/types/domain.ts`
- `src/lib/data/repository.ts`

Why this matters:

- Some types are clearly domain-level, while others are presentation-shaped or route-shaped.
- For example, board cards and board rows sit alongside core business types.
- Over time this makes it harder for a new developer to know what is canonical versus derived.

What needs to be done:

- Separate core domain types from view-model types.
- Introduce folders like:
  - `types/domain`
  - `types/api`
  - `types/view-models`
- Document which layer owns each transformation.

#### 12. UI patterns are readable, but component hierarchy will get hard to follow without stronger composition rules

Files:

- `src/components/dispatch/dispatch-board.tsx`
- `src/components/dashboard/dashboard-overview.tsx`

Why this matters:

- Larger feature components are accumulating state, rendering logic, and view-specific utilities in single files.
- This is still manageable now, but it will become harder to onboard future contributors.

What needs to be done:

- Split large feature files into:
  - container
  - toolbar
  - row
  - card
  - hooks/helpers
- Keep formatting helpers out of component bodies where possible.
- Add lightweight component-level README notes for major feature areas.

### Low

#### 13. Observability is missing

Files:

- application-wide

Why this matters:

- There is no structured logging, request tracing, metric reporting, or operational health monitoring.

What needs to be done:

- Add structured server logs.
- Add request identifiers.
- Add provider error counters and latency metrics.
- Add deployment health checks and dependency health indicators.

#### 14. Documentation is promising but not yet matched to implementation details

Files:

- `README.md`
- `docs/architecture/*`

Why this matters:

- The documentation sets a strong product and architecture vision.
- The implementation has now diverged enough that a new developer could misread current capability as production-ready.

What needs to be done:

- Add a “current implementation status” section.
- Mark stub routes clearly.
- Document current auth behavior and its limitations.
- Add a developer onboarding guide:
  - architecture map
  - local setup
  - current data flow
  - known prototype shortcuts

## Security Checklist

The following should be completed before any broader internal rollout:

- Replace shared-password auth with Entra ID or, at minimum, proper session-backed auth.
- Add rate limiting for login and API routes.
- Add request validation for all APIs.
- Minimize API response payloads and redact unnecessary sensitive fields.
- Move logout to POST.
- Add audit logs for login and sensitive data access.
- Add secure secret-management guidance for deployment.
- Review whether workbook data contains PII or operationally sensitive content and classify it accordingly.
- Add dependency and vulnerability scanning.

## Scalability Checklist

- Break up `repository.ts` into smaller services.
- Introduce query-focused services instead of whole-dataset exports.
- Add caching strategy for workbook data and weather enrichment.
- Add pagination/filter contracts for bulk APIs.
- Replace module-scope eager loading with explicit cache-aware loaders.
- Add background jobs for expensive enrichments.
- Add test data fixtures and deterministic integration tests.
- Add CI and deployment checks.

## Completeness Checklist

- Implement actual upload pipeline and validation for Excel ingestion.
- Replace scaffold AI and validation endpoints with real orchestrated services.
- Add persistent workflow state for scopes, reviews, and approvals.
- Add detail pages or drawers with clear edit/view behavior.
- Add saved filters and durable preferences where the UI implies operational usage.
- Add error states, loading states, and empty states consistently across all pages.
- Add admin capabilities only after auth roles are formalized.

## Readability and Handoff Recommendations

To make the codebase easier for the next programmer to follow:

- Keep features split by vertical slice.
- Avoid mixing domain logic, route contracts, and UI view-models in the same file.
- Add short README files inside major feature folders.
- Standardize naming:
  - `service` for business operations
  - `repository` for data access
  - `provider` for external systems
  - `mapper` for transformations
- Prefer explicit contracts over inferred object shapes.
- Keep route handlers thin and move logic into testable library modules.

## Suggested Implementation Order

### Phase 1: Safety and foundation

1. Pin dependencies and add CI.
2. Add validation layer for all routes.
3. Replace prototype auth with stronger session handling or SSO integration planning.
4. Add test harness and first coverage for parser/auth/repository.

### Phase 2: Service boundaries

1. Split repository into focused services.
2. Separate domain types from view-model/API types.
3. Add explicit API DTOs and response contracts.
4. Introduce structured logging and error helpers.

### Phase 3: Operational readiness

1. Add caching and concurrency control for weather enrichment.
2. Implement durable data ingestion and upload validation.
3. Add role-based authorization.
4. Add audit logs and deployment observability.

### Phase 4: Product completeness

1. Replace scaffold endpoints with production workflows.
2. Add persistence for scopes, approvals, and review actions.
3. Add richer filtering, saved views, and detail workflows.
4. Prepare Entra ID migration and enterprise data connectors.

## Final Assessment

This is a solid prototype with strong product direction and enough structure to keep building, but it is not yet production-ready from a security, operability, or team-scalability standpoint. The fastest path to making it safe and maintainable is not a UI rewrite; it is tightening the service boundaries, auth model, API contracts, testing, and operational controls so that future contributors can work confidently without accidentally expanding prototype shortcuts into production architecture.
