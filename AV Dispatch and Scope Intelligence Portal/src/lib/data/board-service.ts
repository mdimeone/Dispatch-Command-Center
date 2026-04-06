import { DataStore } from "@/lib/data/data-store";
import { SkillSignal, WeeklyDispatchBoardRow } from "@/types/domain";
import { resolveWeatherBatch } from "@/lib/weather/enrichment";

export function getWeeklyDispatchBoardSnapshot(store: DataStore, dayCount = 7, weekOffset = 0) {
  const weekStart = getStartOfWeek(
    store.dispatchRecords[0]?.visitDate ?? "2026-04-06T00:00:00-04:00"
  );
  const offsetWeekStart = addDays(weekStart, weekOffset * 7);
  const safeDayCount = Math.min(Math.max(dayCount, 1), 7);
  const weekDates = Array.from({ length: safeDayCount }, (_, index) => addDays(offsetWeekStart, index));
  const dateKeys = weekDates.map((date) => toDateKey(date));
  const filteredDispatches = store.dispatchRecords.filter((record) =>
    dateKeys.includes(toDateKey(new Date(record.visitDate)))
  );

  const rows = buildWeeklyRows(filteredDispatches, dateKeys);
  const repeatDispatchCount = rows.reduce((total, row) => total + row.repeatDispatchCaseCount, 0);
  const flaggedWorkOrderCount = filteredDispatches.filter((record) => record.blockers.length > 0).length;

  return {
    weekLabel: formatWeekLabel(weekDates[0], weekDates[weekDates.length - 1]),
    dates: weekDates.map((date) => ({
      key: toDateKey(date),
      label: formatBoardDay(date),
      shortDate: formatBoardDate(date)
    })),
    rows,
    summary: {
      weeklyWorkOrders: filteredDispatches.length,
      uniqueCases: new Set(filteredDispatches.map((record) => record.caseNumber)).size,
      repeatDispatchCases: repeatDispatchCount,
      flaggedWorkOrders: flaggedWorkOrderCount
    }
  };
}

export async function getWeeklyDispatchBoardSnapshotWithWeather(
  store: DataStore,
  dayCount = 7,
  weekOffset = 0
) {
  const snapshot = getWeeklyDispatchBoardSnapshot(store, dayCount, weekOffset);
  const dispatchById = new Map(store.dispatchRecords.map((record) => [record.id, record]));

  const requests: Parameters<typeof resolveWeatherBatch>[0] = [];

  for (const row of snapshot.rows) {
    for (const cell of Object.values(row.days)) {
      for (const workOrder of cell.workOrders) {
        const dispatch = dispatchById.get(workOrder.workOrderNumber);
        if (!dispatch) {
          continue;
        }

        requests.push({
          key: toSiteKey(dispatch.site),
          city: dispatch.site.city,
          state: dispatch.site.state,
          street: dispatch.site.address?.street,
          postalCode: dispatch.site.address?.postalCode,
          country: dispatch.site.address?.country,
          scheduledStart: dispatch.visitDate,
          fallbackWeather: dispatch.weather
        });
      }
    }
  }

  const weatherBySiteKey = await resolveWeatherBatch(requests);

  const rows = snapshot.rows.map((row) => ({
    ...row,
    days: Object.fromEntries(
      Object.entries(row.days).map(([dateKey, cell]) => [
        dateKey,
        {
          ...cell,
          workOrders: cell.workOrders.map((workOrder) => {
            const dispatch = dispatchById.get(workOrder.workOrderNumber);
            if (!dispatch) {
              return workOrder;
            }

            const weather = weatherBySiteKey.get(toSiteKey(dispatch.site));
            if (!weather) {
              return workOrder;
            }

            return {
              ...workOrder,
              weather: weather.weather,
              weatherSource: weather.source
            };
          })
        }
      ])
    )
  }));

  return {
    ...snapshot,
    rows
  };
}

function buildWeeklyRows(
  records: DataStore["dispatchRecords"],
  dateKeys: string[]
): WeeklyDispatchBoardRow[] {
  const grouped = new Map<string, DataStore["dispatchRecords"]>();

  for (const record of records) {
    const key = `${record.client.name}__${record.region}`;
    const current = grouped.get(key) ?? [];
    current.push(record);
    grouped.set(key, current);
  }

  return [...grouped.entries()]
    .map(([key, group]) => {
      const [clientName, region] = key.split("__");
      const caseCount = new Set(group.map((record) => record.caseNumber)).size;
      const siteCount = new Set(group.map((record) => record.site.name)).size;
      const repeatCases = new Set(
        group.filter((record) => /repeat dispatch/i.test(record.blockers.join(" "))).map((record) => record.caseNumber)
      ).size;

      return {
        clientName,
        region,
        siteCount,
        uniqueCaseCount: caseCount,
        weeklyWorkOrderCount: group.length,
        repeatDispatchCaseCount: repeatCases,
        flagSummary: uniqueValues(group.flatMap((record) => record.blockers)).slice(0, 4),
        nextStepOwners: uniqueValues(
          group.flatMap((record) =>
            record.notes
              .filter((note) => note.startsWith("Owner: "))
              .map((note) => note.replace("Owner: ", ""))
          )
        ),
        days: Object.fromEntries(
          dateKeys.map((dateKey) => [
            dateKey,
            {
              date: dateKey,
              workOrders: group
                .filter((record) => toDateKey(new Date(record.visitDate)) === dateKey)
                .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())
                .map((record) => ({
                  workOrderNumber: record.id,
                  caseNumber: record.caseNumber,
                  siteName: record.site.name,
                  city: record.site.city,
                  state: record.site.state,
                  scheduledStart: record.visitDate,
                  assignedTo: record.notes.find((note) => note.startsWith("Assigned: "))?.replace(
                    "Assigned: ",
                    ""
                  ),
                  shortDescription: record.visitPurpose,
                  flagSummary: record.blockers,
                  nextStep: record.notes.find((note) => note.startsWith("Next: "))?.replace("Next: ", ""),
                  skillTags: uniqueValues<SkillSignal>(
                    record.notes
                      .filter((note) => note.startsWith("Skills: "))
                      .flatMap((note) => note.replace("Skills: ", "").split(", ") as SkillSignal[])
                  ),
                  weather: record.weather,
                  weatherSource: "fallback" as const
                }))
            }
          ])
        )
      };
    })
    .sort((a, b) => a.clientName.localeCompare(b.clientName));
}

function toSiteKey(site: {
  city: string;
  state: string;
  address?: {
    street?: string;
    postalCode?: string;
    country?: string;
  };
}) {
  return [
    site.address?.street ?? "",
    site.city,
    site.state,
    site.address?.postalCode ?? "",
    site.address?.country ?? ""
  ]
    .map((part) => part.trim().toLowerCase())
    .join("|");
}

function getStartOfWeek(value: string) {
  const date = new Date(value);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(date, mondayOffset);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatBoardDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
}

function formatBoardDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function formatWeekLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function uniqueValues<T>(values: T[]) {
  return [...new Set(values)];
}
