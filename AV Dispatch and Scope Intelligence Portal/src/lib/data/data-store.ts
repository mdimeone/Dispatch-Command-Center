import { parseWorkOrdersOpenCasesRows } from "@/lib/excel/work-orders-open-cases-parser";
import { loadWorkOrdersOpenCasesRows } from "@/lib/excel/work-orders-open-cases-source";
import { DispatchRecord, ServiceCase, WorkOrder } from "@/types/domain";
import { attachTechnicianIds, attachTechnicians, toDispatchRecord } from "@/lib/data/mappers";

export interface DataStore {
  loadedWorkbookData: ReturnType<typeof loadWorkOrdersOpenCasesRows>;
  serviceCases: ServiceCase[];
  workOrders: WorkOrder[];
  caseMap: Map<string, ServiceCase>;
  dispatchRecords: DispatchRecord[];
}

let cachedDataStore: DataStore | null = null;

export function getDataStore(): DataStore {
  if (cachedDataStore) {
    return cachedDataStore;
  }

  const loadedWorkbookData = loadWorkOrdersOpenCasesRows();
  const parsedData = parseWorkOrdersOpenCasesRows(loadedWorkbookData.rows);
  const serviceCases = parsedData.cases.map((serviceCase) => attachTechnicians(serviceCase));
  const workOrders = parsedData.workOrders.map((workOrder) => attachTechnicianIds(workOrder));

  const caseMap = new Map(serviceCases.map((serviceCase) => [serviceCase.caseNumber, serviceCase]));
  const dispatchRecords = workOrders
    .map((workOrder) => toDispatchRecord(workOrder, caseMap.get(workOrder.caseNumber)))
    .filter((record): record is DispatchRecord => record !== null);

  cachedDataStore = {
    loadedWorkbookData,
    serviceCases,
    workOrders,
    caseMap,
    dispatchRecords
  };

  return cachedDataStore;
}

export function resetDataStoreCache() {
  cachedDataStore = null;
}
