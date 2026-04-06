import { CaseRollup } from "@/types/domain";
import { DataStore } from "@/lib/data/data-store";

export function getCaseRollups(store: DataStore): CaseRollup[] {
  return store.serviceCases.map((serviceCase) => {
    const relatedWorkOrders = store.workOrders.filter(
      (workOrder) => workOrder.caseNumber === serviceCase.caseNumber
    );
    const latestWorkOrder = [...relatedWorkOrders].sort(compareWorkOrdersDesc)[0];

    return {
      caseNumber: serviceCase.caseNumber,
      totalWorkOrders: relatedWorkOrders.length,
      openWorkOrders: relatedWorkOrders.filter((workOrder) => !isClosedState(workOrder.state)).length,
      completedWorkOrders: relatedWorkOrders.filter((workOrder) => isClosedState(workOrder.state)).length,
      repeatVisitCount: Math.max(0, relatedWorkOrders.length - 1),
      hasRepeatDispatch: relatedWorkOrders.length > 1,
      latestWorkOrderNumber: latestWorkOrder?.workOrderNumber,
      latestScheduledStart: latestWorkOrder?.scheduledStart,
      latestCaseSignalTypes: serviceCase.caseSignals.map((signal) => signal.type),
      latestWorkOrderSignalTypes: latestWorkOrder?.workOrderSignals.map((signal) => signal.type) ?? []
    };
  });
}

function compareWorkOrdersDesc(a: DataStore["workOrders"][number], b: DataStore["workOrders"][number]) {
  return new Date(b.scheduledStart ?? 0).getTime() - new Date(a.scheduledStart ?? 0).getTime();
}

function isClosedState(state: string) {
  return /closed|cancelled/i.test(state);
}
