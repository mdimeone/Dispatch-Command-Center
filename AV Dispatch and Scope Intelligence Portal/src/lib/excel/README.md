This folder is reserved for the temporary Excel ingestion layer.

The current scaffold now supports a local workbook path for the work-orders-to-open-cases source,
with a sample fallback if the configured file is unavailable.

Current flow:

- load the workbook path from `EXCEL_WORK_ORDERS_OPEN_CASES_FILE`
- read the first worksheet
- map raw workbook headers into the normalized row shape
- parse rows into `ServiceCase` and `WorkOrder` domain entities
- fall back to in-repo sample rows when the workbook is unavailable

When additional Excel files are introduced, add parsers here that translate workbook structures
into the domain interfaces in `src/types/domain.ts`.
