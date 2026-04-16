import "server-only";

import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import {
  LaborProviderDirectoryRow,
  sampleLaborProviderDirectoryRows
} from "@/lib/excel/sample-labor-provider-source";

const DEFAULT_WORKBOOK_PATH = "./data/current/labor_provider_directory.xlsx";

const headerAliases: Record<keyof LaborProviderDirectoryRow, string[]> = {
  providerName: ["provider_name", "Provider Name", "providerName"],
  city: ["city", "City"],
  state: ["state", "State"],
  skillFocus: ["skill_focus", "Skill Focus", "skillFocus"],
  leadTime: ["lead_time", "Lead Time", "leadTime"],
  coverageType: ["coverage_type", "Coverage Type", "coverageType"],
  active: ["active", "Active"],
  notes: ["notes", "Notes"]
};

export function loadLaborProviderDirectoryRows() {
  const dataSource = process.env.DATA_SOURCE?.toLowerCase() ?? "excel";

  if (dataSource === "sample") {
    return {
      rows: sampleLaborProviderDirectoryRows,
      meta: {
        source: "sample",
        filePath: null as string | null
      }
    };
  }

  const configuredPath =
    process.env.EXCEL_LABOR_PROVIDER_FILE?.trim() || DEFAULT_WORKBOOK_PATH;
  const resolvedPath = resolveWorkbookPath(configuredPath);

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    return {
      rows: sampleLaborProviderDirectoryRows,
      meta: {
        source: "sample-fallback",
        filePath: resolvedPath ?? configuredPath
      }
    };
  }

  const workbookBuffer = fs.readFileSync(resolvedPath);
  const workbook = XLSX.read(workbookBuffer, { type: "buffer", cellDates: false });
  const worksheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[worksheetName];

  if (!worksheet) {
    return {
      rows: sampleLaborProviderDirectoryRows,
      meta: {
        source: "sample-fallback",
        filePath: resolvedPath
      }
    };
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });
  const rows = rawRows
    .map(mapWorkbookRow)
    .filter((row): row is LaborProviderDirectoryRow => row !== null)
    .filter((row) => !/^no$/i.test(row.active?.trim() ?? ""));

  return {
    rows: rows.length ? rows : sampleLaborProviderDirectoryRows,
    meta: {
      source: rows.length ? "excel-local-path" : "sample-fallback",
      filePath: resolvedPath
    }
  };
}

function mapWorkbookRow(raw: Record<string, unknown>): LaborProviderDirectoryRow | null {
  const row: Partial<LaborProviderDirectoryRow> = {};

  for (const key of Object.keys(headerAliases) as Array<keyof LaborProviderDirectoryRow>) {
    row[key] = normalizeCellValue(readFirstAlias(raw, headerAliases[key]));
  }

  if (!row.providerName) {
    return null;
  }

  return {
    providerName: row.providerName,
    city: row.city || "ALL",
    state: row.state || "ALL",
    skillFocus: row.skillFocus || "General AV Field Services",
    leadTime: row.leadTime || "TBD",
    coverageType: row.coverageType || undefined,
    active: row.active || undefined,
    notes: row.notes || undefined
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

  return String(value).trim();
}

function resolveWorkbookPath(filePath: string) {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(/*turbopackIgnore: true*/ process.cwd(), filePath);
}
