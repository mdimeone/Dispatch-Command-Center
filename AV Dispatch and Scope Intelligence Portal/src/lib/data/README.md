# Data Layer Overview

This folder separates data responsibilities so the rest of the app can consume stable APIs without depending on one large module.

## Modules

- `repository.ts`
  - Public facade consumed by pages/components/routes.
  - Keeps existing function signatures stable.
  - Delegates to focused services.

- `data-store.ts`
  - Owns workbook loading, parsing, and normalized in-memory datasets.
  - Exposes `getDataStore()` for lazy cached access.
  - Exposes `resetDataStoreCache()` for explicit invalidation.

- `mappers.ts`
  - Domain mapping and normalization helpers.
  - Converts parsed case/work-order data into dispatch records.

- `query-service.ts`
  - Read/query accessors for dispatches, cases, work orders, and metadata.

- `metrics-service.ts`
  - Dashboard metrics, queues, and reporting snapshots.

- `case-service.ts`
  - Case rollup logic and work-order rollup helpers.

- `board-service.ts`
  - Weekly board shaping and weather-enriched board snapshots.

## Ownership Boundaries

- Data ingestion/parsing lifecycle: `data-store.ts`
- Transform raw parsed records into domain objects: `mappers.ts`
- Query/read APIs for routes/UI: `query-service.ts`
- Derived analytics and queue metrics: `metrics-service.ts`
- Board-specific view modeling: `board-service.ts`
- Cross-module API surface for callers: `repository.ts`

## Cache + Invalidation

The data store is process-local in-memory cache.

- First call to `getDataStore()` loads and parses workbook data.
- Subsequent calls reuse cached data for lower latency.
- Use `resetDataStoreCache()` when source workbook data changes and you need fresh reads.

Suggested invalidation triggers:

1. After successful upload/import of a new workbook.
2. After manual file replacement in `data/current`.
3. During operational refresh endpoints/jobs (if introduced).

## Future Improvements

- Add a time-based refresh policy (TTL) around `getDataStore()`.
- Add structured health/telemetry around load and parse operations.
- Move cache state to shared store if running multiple app instances.
