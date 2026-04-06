# Work Orders to Open Cases Column Map

## Source workbook

- Workbook: `[FSD] Work Orders Tied To Open Cases.xlsx`
- Worksheet: `Page 1`
- Legend source: `Data Legend.xlsx`
- Legend rule: row 1 contains raw export headers and row 3 contains the approved friendly names

## Mapping rules

- Use the friendly names in this document for UI labels, parser output labels, and internal mapping references.
- Preserve the raw export headers as aliases so the ingestion layer can verify and troubleshoot incoming files.
- Prefer mapping by header name, with a fallback to column position only if an export variant introduces harmless formatting drift.
- Treat narrative note fields as long-form text and avoid rendering them in narrow table cells by default.

## Column map

| Column | Raw export header | Friendly name | Suggested grouping | Parser note |
| --- | --- | --- | --- | --- |
| 1 | `Number` | `Work Order Number` | Work Order | Primary work order identifier |
| 2 | `State` | `Work Order State` | Work Order | Work order lifecycle status |
| 3 | `Scheduled start` | `Work Order Scheduled Start` | Work Order | Scheduled visit date/time when present |
| 4 | `Work notes` | `Work Order Work Notes` | Work Order | Long-form work order history |
| 5 | `Assignment group` | `Work Order Assignment Group` | Work Order | Owning work order team |
| 6 | `Assigned to` | `Work Order Assigned To` | Work Order | Assigned technician or owner |
| 7 | `Initiated from` | `Case Number` | Case | Primary case identifier |
| 8 | `State2` | `Case State` | Case | Case lifecycle status |
| 9 | `Assignment group 3` | `Case Assignment Group` | Case | Owning case team |
| 10 | `Account` | `Account` | Account | Customer account name |
| 11 | `Location` | `Site Name` | Site | Site or room/site label used by dispatch |
| 12 | `Short description` | `Case Short Description` | Case | Concise issue summary |
| 13 | `Street` | `Street` | Site | Site street address |
| 14 | `City` | `City` | Site | Site city |
| 15 | `State / Province` | `State / Province` | Site | Site state or province |
| 16 | `Zip / Postal Code` | `Zip / Postal Code` | Site | Site postal code |
| 17 | `Country` | `Country` | Site | Site country |
| 18 | `Priority` | `Priority` | Case | Source urgency field |
| 19 | `Name` | `Name` | Contact | Primary customer contact name |
| 20 | `Email` | `Email` | Contact | Primary customer contact email |
| 21 | `Mobile phone` | `Mobile phone` | Contact | Mobile contact number |
| 22 | `Business phone` | `Business phone` | Contact | Business contact number |
| 23 | `Contract` | `Contract` | Contract | Contract identifier |
| 24 | `Name4` | `Entitlement` | Contract | Contract or entitlement display name |
| 25 | `Comments and Work notes` | `Comments and Work notes` | Case | Long-form case history and comments |

## Normalized target guidance

This workbook should not be exposed directly to page components. The parser layer should translate it into the normalized domain entities in `src/types/domain.ts`.

Recommended first-pass mapping targets:

| Friendly name | Suggested normalized target | Notes |
| --- | --- | --- |
| `Work Order Number` | `DispatchRecord.id` or supporting source field | Keep raw value available even if a separate internal id is introduced |
| `Case Number` | `DispatchRecord.caseNumber` and `Scope.caseNumber` | Core join field across views |
| `Case Short Description` | `DispatchRecord.visitPurpose` | May need cleanup if source text includes ticket prefixes |
| `Work Order Scheduled Start` | `DispatchRecord.visitDate` | Normalize to ISO timestamp when possible |
| `Priority` | `DispatchRecord.urgency` | Convert source values such as `1 - Critical`, `2 - High`, `3 - Moderate` into app urgency buckets |
| `Account` | `DispatchRecord.client.name` | Client id can be derived separately |
| `Site Name` | `DispatchRecord.site.name` | Preserve full source value |
| `City` | `DispatchRecord.site.city` | Straight map |
| `State / Province` | `DispatchRecord.site.state` | Straight map |
| `Street` | `DispatchRecord.site.accessNotes` or supporting site address field | The current domain model does not yet have dedicated street/postal fields |
| `Zip / Postal Code` | supporting site address field | Extend normalized model if postal detail is needed in UI |
| `Country` | supporting site address field | Extend normalized model if country-aware routing is needed |
| `Work Order Assigned To` | `DispatchRecord.assignedTechIds` via lookup | Requires technician matching logic |
| `Work Order Assignment Group` | `DispatchRecord.supervisor`, `region`, or supporting source field | Final target depends on business meaning |
| `Case Assignment Group` | supporting case metadata field | Add explicit field if routing ownership matters in UI |
| `Work Order Work Notes` | `DispatchRecord.notes` | Consider summary extraction instead of passing full history into list views |
| `Comments and Work notes` | `DispatchRecord.notes` or case-detail history field | Best used in expanded detail or AI summarization workflows |
| `Name`, `Email`, `Mobile phone`, `Business phone` | supporting contact object | The current domain model does not yet expose a dedicated contact type on `DispatchRecord` |
| `Contract` | supporting contract metadata field | Keep available for filtering and entitlement checks |
| `Entitlement` | supporting contract metadata field | Useful for scope validation and eligibility context |

## Parser cautions

- `State` and `State2` are different fields and should not be collapsed together.
- `Work Order Work Notes` and `Comments and Work notes` are distinct note streams.
- `Name4` is not meaningful as a UI label and should always be normalized to `Entitlement`.
- Contact and address detail exceed the current normalized `Site` and `DispatchRecord` shapes, so parser work will likely require small domain-model extensions.
- If the export changes again, update `Data Legend.xlsx` first and then mirror the approved mapping here.
