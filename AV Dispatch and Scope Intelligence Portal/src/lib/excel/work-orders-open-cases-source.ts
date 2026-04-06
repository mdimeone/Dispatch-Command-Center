import "server-only";

import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { sampleWorkOrdersOpenCasesRows } from "@/lib/excel/sample-work-orders-open-cases-source";
import { WorkOrdersOpenCasesRow } from "@/lib/excel/work-orders-open-cases-parser";

const DEFAULT_WORKBOOK_PATH = "./data/current/work-orders-open-cases.xlsx";

const headerAliases: Record<keyof WorkOrdersOpenCasesRow, string[]> = {
  workOrderNumber: ["Number"],
  workOrderState: ["State"],
  workOrderScheduledStart: ["Scheduled start"],
  workOrderWorkNotes: ["Work notes"],
  workOrderAssignmentGroup: ["Assignment group"],
  workOrderAssignedTo: ["Assigned to"],
  caseNumber: ["Initiated from"],
  caseState: ["State2"],
  caseAssignmentGroup: ["Assignment group 3", "Assignment group3"],
  account: ["Account"],
  siteName: ["Location"],
  caseShortDescription: ["Short description"],
  street: ["Street"],
  city: ["City"],
  stateOrProvince: ["State / Province"],
  zipOrPostalCode: ["Zip / Postal Code"],
  country: ["Country"],
  priority: ["Priority"],
  contactName: ["Name"],
  email: ["Email"],
  mobilePhone: ["Mobile phone"],
  businessPhone: ["Business phone"],
  contract: ["Contract"],
  entitlement: ["Name4"],
  commentsAndWorkNotes: ["Comments and Work notes"]
};

export function loadWorkOrdersOpenCasesRows() {
  const dataSource = process.env.DATA_SOURCE?.toLowerCase() ?? "excel";

  if (dataSource === "sample") {
    return {
      rows: sampleWorkOrdersOpenCasesRows,
      meta: {
        source: "sample",
        filePath: null as string | null
      }
    };
  }

  const configuredPath =
    process.env.EXCEL_WORK_ORDERS_OPEN_CASES_FILE?.trim() || DEFAULT_WORKBOOK_PATH;
  const resolvedPath = resolveWorkbookPath(configuredPath);

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    return {
      rows: sampleWorkOrdersOpenCasesRows,
      meta: {
        source: "sample-fallback",
        filePath: resolvedPath ?? configuredPath
      }
    };
  }

  const workbookBuffer = fs.readFileSync(resolvedPath);
  const workbook = XLSX.read(workbookBuffer, { type: "buffer", cellDates: true });
  const worksheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[worksheetName];

  if (!worksheet) {
    return {
      rows: sampleWorkOrdersOpenCasesRows,
      meta: {
        source: "sample-fallback",
        filePath: resolvedPath
      }
    };
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });
  const rows = rawRows
    .map(mapWorkbookRow)
    .filter(
      (row): row is WorkOrdersOpenCasesRow =>
        row !== null && Boolean(row.caseNumber) && Boolean(row.workOrderNumber)
    );

  return {
    rows: rows.length ? rows : sampleWorkOrdersOpenCasesRows,
    meta: {
      source: rows.length ? "excel-local-path" : "sample-fallback",
      filePath: resolvedPath
    }
  };
}

function mapWorkbookRow(raw: Record<string, unknown>): WorkOrdersOpenCasesRow | null {
  const row: Partial<WorkOrdersOpenCasesRow> = {};

  for (const key of Object.keys(headerAliases) as Array<keyof WorkOrdersOpenCasesRow>) {
    row[key] = normalizeCellValue(readFirstAlias(raw, headerAliases[key]));
  }

  if (!row.workOrderNumber || !row.caseNumber) {
    return null;
  }

  return {
    workOrderNumber: row.workOrderNumber,
    workOrderState: row.workOrderState ?? "",
    workOrderScheduledStart: normalizeDateValue(readFirstAlias(raw, headerAliases.workOrderScheduledStart)),
    workOrderWorkNotes: row.workOrderWorkNotes ?? "",
    workOrderAssignmentGroup: row.workOrderAssignmentGroup || undefined,
    workOrderAssignedTo: row.workOrderAssignedTo || undefined,
    caseNumber: row.caseNumber,
    caseState: row.caseState ?? "",
    caseAssignmentGroup: row.caseAssignmentGroup || undefined,
    account: row.account ?? "",
    siteName: row.siteName ?? "",
    caseShortDescription: row.caseShortDescription ?? "",
    street: row.street ?? "",
    city: row.city ?? "",
    stateOrProvince: row.stateOrProvince ?? "",
    zipOrPostalCode: row.zipOrPostalCode ?? "",
    country: row.country ?? "",
    priority: row.priority ?? "",
    contactName: row.contactName || undefined,
    email: row.email || undefined,
    mobilePhone: row.mobilePhone || undefined,
    businessPhone: row.businessPhone || undefined,
    contract: row.contract || undefined,
    entitlement: row.entitlement || undefined,
    commentsAndWorkNotes: row.commentsAndWorkNotes ?? ""
  };
}

function readFirstAlias(raw: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    if (alias in raw) {
      return raw[alias];
    }
  }

  return "";
}

function normalizeCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value).trim();
}

function normalizeDateValue(value: unknown) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const normalized = String(value).trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? normalized : parsed.toISOString();
}

function resolveWorkbookPath(filePath: string) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

