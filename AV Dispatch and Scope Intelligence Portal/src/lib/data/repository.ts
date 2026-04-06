import { projects, technicians } from "@/lib/data/sample-data";
import { getDataStore } from "@/lib/data/data-store";
import {
  getCaseByNumber as getCaseByNumberFromStore,
  getDataSourceMeta as getDataSourceMetaFromStore,
  getDispatchById as getDispatchByIdFromStore,
  getDispatches as getDispatchesFromStore,
  getServiceCaseByNumber as getServiceCaseByNumberFromStore,
  getServiceCases as getServiceCasesFromStore,
  getWorkOrders as getWorkOrdersFromStore
} from "@/lib/data/query-service";
import {
  getDashboardSnapshot as getDashboardSnapshotFromStore,
  getReportsSnapshot,
  getReviewQueue as getReviewQueueFromStore,
  getValidationQueue as getValidationQueueFromStore
} from "@/lib/data/metrics-service";
import { getCaseRollups as getCaseRollupsFromStore } from "@/lib/data/case-service";
import {
  getWeeklyDispatchBoardSnapshot as getWeeklyDispatchBoardSnapshotFromStore,
  getWeeklyDispatchBoardSnapshotWithWeather as getWeeklyDispatchBoardSnapshotWithWeatherFromStore
} from "@/lib/data/board-service";

export function getDashboardSnapshot() {
  return getDashboardSnapshotFromStore(getDataStore());
}

export function getDispatches() {
  return getDispatchesFromStore(getDataStore());
}

export function getDataSourceMeta() {
  return getDataSourceMetaFromStore(getDataStore());
}

export function getDispatchById(id: string) {
  return getDispatchByIdFromStore(getDataStore(), id);
}

export function getCaseByNumber(caseNumber: string) {
  return getCaseByNumberFromStore(getDataStore(), caseNumber);
}

export function getServiceCases() {
  return getServiceCasesFromStore(getDataStore());
}

export function getServiceCaseByNumber(caseNumber: string) {
  return getServiceCaseByNumberFromStore(getDataStore(), caseNumber);
}

export function getWorkOrders() {
  return getWorkOrdersFromStore(getDataStore());
}

export function getProjects() {
  return projects;
}

export function getTechniciansForDispatch(assignedTechIds: string[]) {
  return technicians.filter((technician) => assignedTechIds.includes(technician.id));
}

export function getReviewQueue() {
  return getReviewQueueFromStore(getDataStore());
}

export function getValidationQueue() {
  return getValidationQueueFromStore(getDataStore());
}

export { getReportsSnapshot };

export function getCaseRollups() {
  return getCaseRollupsFromStore(getDataStore());
}

export function getWeeklyDispatchBoardSnapshot(dayCount = 7, weekOffset = 0) {
  return getWeeklyDispatchBoardSnapshotFromStore(getDataStore(), dayCount, weekOffset);
}

export function getWeeklyDispatchBoardSnapshotWithWeather(dayCount = 7, weekOffset = 0) {
  return getWeeklyDispatchBoardSnapshotWithWeatherFromStore(getDataStore(), dayCount, weekOffset);
}
