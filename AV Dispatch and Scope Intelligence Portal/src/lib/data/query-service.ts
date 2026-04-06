import { DataStore } from "@/lib/data/data-store";

export function getDispatches(store: DataStore) {
  return store.dispatchRecords;
}

export function getDataSourceMeta(store: DataStore) {
  return store.loadedWorkbookData.meta;
}

export function getDispatchById(store: DataStore, id: string) {
  return store.dispatchRecords.find((record) => record.id === id) ?? null;
}

export function getCaseByNumber(store: DataStore, caseNumber: string) {
  return store.dispatchRecords.find((record) => record.caseNumber === caseNumber) ?? null;
}

export function getServiceCases(store: DataStore) {
  return store.serviceCases;
}

export function getServiceCaseByNumber(store: DataStore, caseNumber: string) {
  return store.caseMap.get(caseNumber) ?? null;
}

export function getWorkOrders(store: DataStore) {
  return store.workOrders;
}
