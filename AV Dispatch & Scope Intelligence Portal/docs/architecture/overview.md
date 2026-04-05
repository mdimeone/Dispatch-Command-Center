# Architecture Overview

## Current shape

This scaffold is a Next.js App Router project built around a normalized domain layer and a service/repository pattern.

- `src/types/domain.ts` defines the stable business entities.
- `src/lib/data/repository.ts` is the app-facing read model.
- `src/lib/data/sample-data.ts` provides the initial sample source.
- `src/app/api/*` exposes business-oriented route handlers.
- `src/lib/excel/*` is reserved for temporary Excel ingestion.

## Why this shape

The README emphasizes future migration from sample and Excel-backed workflows to enterprise APIs. To support that:

- UI routes consume repository functions instead of workbook structures.
- API responses are normalized around dispatch, scope, and validation entities.
- weather, traffic, AI, and validation capabilities each have a dedicated library area.

## Near-term implementation path

1. Add Excel workbook parsers that map spreadsheet columns into domain models.
2. Replace the in-memory sample repository with a connector-aware data service.
3. Introduce persistent scope storage and revision history.
4. Add protected actions for AI generation, review, and approvals.
5. Layer in Microsoft Entra ID and enterprise data connectors later without rewriting the UI.
