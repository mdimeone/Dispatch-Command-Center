# Architecture Overview

## Current shape

This scaffold is a Next.js App Router project built around a normalized domain layer and a service/repository pattern.

- `src/types/domain.ts` defines the stable business entities.
- `src/lib/data/repository.ts` is the app-facing read model.
- `src/lib/data/sample-data.ts` provides the initial sample source.
- `src/app/api/*` exposes business-oriented route handlers.
- `src/lib/excel/*` is reserved for temporary Excel ingestion.
- `docs/architecture/case-work-order-domain-model.md` defines the target parent/child model for real service data.

## Why this shape

The README emphasizes future migration from sample and Excel-backed workflows to enterprise APIs. To support that:

- UI routes consume repository functions instead of workbook structures.
- API responses are normalized around dispatch, scope, and validation entities.
- weather, traffic, AI, and validation capabilities each have a dedicated library area.

## Near-term implementation path

1. Replace the flat prototype dispatch shape with separate `Case` and `WorkOrder` domain entities.
2. Add Excel workbook parsers that map spreadsheet columns into domain models.
3. Replace the in-memory sample repository with a connector-aware data service.
4. Introduce persistent scope storage and revision history.
5. Add protected actions for AI generation, review, and approvals.
6. Layer in Microsoft Entra ID and enterprise data connectors later without rewriting the UI.
