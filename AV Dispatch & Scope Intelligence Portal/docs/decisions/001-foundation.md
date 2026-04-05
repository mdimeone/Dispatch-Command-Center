# Decision 001: Start with a service-first prototype scaffold

## Status

Accepted

## Context

The project needs to ship quickly on Railway, begin with temporary data sources, and stay ready for a later enterprise migration.

## Decision

Build the first version as a Next.js App Router application with:

- TypeScript domain models
- a repository/service abstraction
- sample data as the initial source
- route handlers shaped around business actions
- UI routes that do not know about workbook structure

## Consequences

Positive:

- Fast prototype momentum
- Stable contracts for future Excel and API connectors
- Lower risk of rewriting the UI when the data source changes

Tradeoffs:

- The first release uses representative sample data rather than live workbook parsing
- Some workflows are scaffolded as stubs until integrations are connected
