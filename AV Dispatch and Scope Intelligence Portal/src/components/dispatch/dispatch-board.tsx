"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Route as AppRoute } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  CloudSun,
  Repeat,
  Route,
  Search,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getWeeklyDispatchBoardSnapshotWithWeather } from "@/lib/data/repository";
import { cn, formatVisitDate } from "@/lib/utils";

type WeeklyDispatchBoardSnapshot = Awaited<ReturnType<typeof getWeeklyDispatchBoardSnapshotWithWeather>>;
type DayWindow = 3 | 5 | 7;
type DispatchWorkOrder = WeeklyDispatchBoardSnapshot["rows"][number]["days"][string]["workOrders"][number];

const DAY_OPTIONS: DayWindow[] = [3, 5, 7];

export function DispatchBoard({
  snapshot,
  weekOffset
}: {
  snapshot: WeeklyDispatchBoardSnapshot;
  weekOffset: number;
}) {
  const [dayWindow, setDayWindow] = useState<DayWindow>(5);
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [searchQuery, setSearchQuery] = useState("");
  const [compactMode, setCompactMode] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const visibleDates = useMemo(
    () => snapshot.dates.slice(0, Math.min(dayWindow, snapshot.dates.length)),
    [dayWindow, snapshot.dates]
  );

  const regions = useMemo(
    () => ["All regions", ...new Set(snapshot.rows.map((row) => row.region).filter(Boolean).sort())],
    [snapshot.rows]
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return snapshot.rows.filter((row) => {
      if (regionFilter !== "All regions" && row.region !== regionFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const rowMatch = [row.clientName, row.region, ...row.nextStepOwners, ...row.flagSummary]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

      if (rowMatch) {
        return true;
      }

      return visibleDates.some((day) =>
        row.days[day.key]?.workOrders.some((workOrder: DispatchWorkOrder) =>
          [
            workOrder.workOrderNumber,
            workOrder.caseNumber,
            workOrder.siteName,
            workOrder.city,
            workOrder.state,
            workOrder.assignedTo,
            workOrder.shortDescription,
            workOrder.nextStep,
            ...workOrder.flagSummary,
            ...workOrder.skillTags
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        )
      );
    });
  }, [regionFilter, searchQuery, snapshot.rows, visibleDates]);

  const visibleDayKeys = visibleDates.map((day) => day.key);
  const visibleWorkOrderCount = filteredRows.reduce(
    (total, row) =>
      total +
      visibleDayKeys.reduce(
        (rowTotal, dayKey) => rowTotal + (row.days[dayKey]?.workOrders.length ?? 0),
        0
      ),
    0
  );

  const dayGridColumns = `220px 110px 64px 70px 136px repeat(${visibleDates.length}, minmax(${compactMode ? "196px" : "236px"}, 1fr))`;
  const scrollStep = compactMode ? 320 : 400;

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const updateScrollState = () => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setCanScrollLeft(container.scrollLeft > 8);
      setCanScrollRight(maxScrollLeft - container.scrollLeft > 8);
    };

    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [compactMode, dayWindow, filteredRows.length, regionFilter, searchQuery, visibleDates.length]);

  function scrollBoard(direction: "left" | "right") {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left: direction === "left" ? -scrollStep : scrollStep,
      behavior: "smooth"
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-3xl leading-tight text-slate-950 xl:text-[2.9rem]">
            Weekly Client Dispatch Board
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <WeekLink weekOffset={weekOffset - 1}>
            <ArrowLeft className="h-4 w-4" />
            Prev
          </WeekLink>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
            <CalendarRange className="h-4 w-4 text-sky-700" />
            {snapshot.weekLabel}
          </div>
          <WeekLink weekOffset={weekOffset + 1}>
            Next
            <ArrowRight className="h-4 w-4" />
          </WeekLink>
        </div>
      </div>

      <Card className="px-5 py-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <InlineStat icon={Route} label="Visible visits" value={String(visibleWorkOrderCount)} detail="Current board window" />
          <InlineStat icon={Repeat} label="Filtered rows" value={String(filteredRows.length)} detail="Client-region groupings" />
          <InlineStat icon={CloudSun} label="Weather-aware" value={String(snapshot.summary.flaggedWorkOrders)} detail="Forecast-backed visits" />
          <InlineStat icon={ShieldCheck} label="Regions" value={String(regions.length - 1)} detail="Directly filterable" />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="sky">Compact Planning View</Badge>
            <Badge tone="slate">{filteredRows.length} rows shown</Badge>
            <Badge tone="amber">{visibleDates.length} days visible</Badge>
            <Badge tone="green">{regions.length - 1} regions available</Badge>
          </div>
        </div>

        <div className="sticky top-3 z-[60] border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <label className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search WO, case, site, technician, or flag"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white"
                />
              </label>

              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Region</span>
                <select
                  value={regionFilter}
                  onChange={(event) => setRegionFilter(event.target.value)}
                  className="bg-transparent text-sm text-slate-800 outline-none"
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-2xl bg-slate-100 p-1">
                {DAY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDayWindow(option)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-semibold transition",
                      dayWindow === option ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {option} day
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCompactMode((current) => !current)}
                className={cn(
                  "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                  compactMode
                    ? "border-sky-200 bg-sky-50 text-sky-900"
                    : "border-slate-200 bg-white text-slate-700"
                )}
              >
                {compactMode ? "Compact cards" : "Comfortable cards"}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-2 text-xs font-medium text-slate-500">
          Scroll horizontally to the right to see the full {visibleDates.length}-day window when it extends past the page width.
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-40 w-8 bg-gradient-to-r from-white via-white/85 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-40 w-10 bg-gradient-to-l from-white via-white/85 to-transparent" />

          <button
            type="button"
            onClick={() => scrollBoard("left")}
            disabled={!canScrollLeft}
            className={cn(
              "absolute left-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 text-slate-700 shadow-sm transition",
              canScrollLeft
                ? "border-slate-200 hover:border-sky-200 hover:text-sky-700"
                : "cursor-default border-slate-100 text-slate-300 shadow-none"
            )}
            aria-label="Scroll dispatch board left"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollBoard("right")}
            disabled={!canScrollRight}
            className={cn(
              "absolute right-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 text-slate-700 shadow-sm transition",
              canScrollRight
                ? "border-slate-200 hover:border-sky-200 hover:text-sky-700"
                : "cursor-default border-slate-100 text-slate-300 shadow-none"
            )}
            aria-label="Scroll dispatch board right"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto overscroll-x-contain scroll-smooth"
          >
            <div className="min-w-max" style={{ display: "grid", gridTemplateColumns: dayGridColumns }}>
              <HeaderCell className="sticky left-0 z-30">Company</HeaderCell>
              <HeaderCell className="sticky left-[220px] z-30">Region</HeaderCell>
              <HeaderCell>WOs</HeaderCell>
              <HeaderCell>Cases</HeaderCell>
              <HeaderCell>Flags</HeaderCell>
              {visibleDates.map((day) => (
                <HeaderCell key={day.key}>
                  <div>
                    <p>{day.label}</p>
                    <p className="mt-1 text-[11px] font-medium normal-case tracking-normal text-slate-400">{day.shortDate}</p>
                  </div>
                </HeaderCell>
              ))}

              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <DispatchRow
                    key={`${row.clientName}-${row.region}`}
                    row={row}
                    dayKeys={visibleDayKeys}
                    compactMode={compactMode}
                  />
                ))
              ) : (
                <EmptyState totalColumns={5 + visibleDates.length} />
              )}
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}

function InlineStat({ icon: Icon, label, value, detail }: { icon: typeof Route; label: string; value: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <div className="mt-1 flex items-baseline gap-3">
          <p className="text-3xl font-semibold text-slate-950">{value}</p>
          <p className="text-sm text-slate-600">{detail}</p>
        </div>
      </div>
      <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function WeekLink({
  children,
  weekOffset
}: {
  children: ReactNode;
  weekOffset: number;
}) {
  const href = (weekOffset === 0 ? "/dispatch-board" : `/dispatch-board?weekOffset=${weekOffset}`) as AppRoute;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:text-sky-800"
    >
      {children}
    </Link>
  );
}

function HeaderCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 last:border-r-0",
        className
      )}
    >
      {children}
    </div>
  );
}

function DispatchRow({
  row,
  dayKeys,
  compactMode
}: {
  row: WeeklyDispatchBoardSnapshot["rows"][number];
  dayKeys: string[];
  compactMode: boolean;
}) {
  return (
    <>
      <Cell className="sticky left-0 z-20 border-l-4 border-l-sky-500 bg-white/95 backdrop-blur">
        <p className="font-semibold text-slate-950">{row.clientName}</p>
        <p className="mt-2 text-sm text-slate-500">{row.siteCount} site{row.siteCount === 1 ? "" : "s"}</p>
      </Cell>

      <Cell className="sticky left-[220px] z-20 bg-white/95 backdrop-blur">
        <p className="font-medium text-slate-800">{row.region}</p>
        {row.nextStepOwners.length ? <p className="mt-2 text-xs text-slate-500">{row.nextStepOwners.join(", ")}</p> : null}
      </Cell>

      <Cell><p className="text-2xl font-semibold text-slate-950">{row.weeklyWorkOrderCount}</p></Cell>

      <Cell>
        <p className="text-2xl font-semibold text-slate-950">{row.uniqueCaseCount}</p>
        {row.repeatDispatchCaseCount > 0 ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-amber-700">{row.repeatDispatchCaseCount} repeat</p> : null}
      </Cell>

      <Cell className="bg-amber-50/70">
        <div className="flex flex-wrap gap-2">
          {row.flagSummary.length ? row.flagSummary.map((flag) => <Badge key={flag} tone={flagTone(flag)}>{flag}</Badge>) : <span className="text-sm text-slate-400">No active flags</span>}
        </div>
      </Cell>

      {dayKeys.map((dayKey) => (
        <Cell key={dayKey} className="align-top">
          <div className={cn("space-y-2", compactMode ? "min-h-[84px]" : "min-h-[112px]")}>
            {row.days[dayKey]?.workOrders.length ? row.days[dayKey].workOrders.map((workOrder: DispatchWorkOrder) => (
              <DispatchWorkOrderCard
                key={workOrder.workOrderNumber}
                workOrder={workOrder}
                compactMode={compactMode}
              />
            )) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Nothing scheduled
              </div>
            )}
          </div>
        </Cell>
      ))}
    </>
  );
}

function DispatchWorkOrderCard({
  workOrder,
  compactMode
}: {
  workOrder: DispatchWorkOrder;
  compactMode: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const primaryFlags = workOrder.flagSummary.slice(0, compactMode ? 2 : 4);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="sky">{workOrder.workOrderNumber}</Badge>
          <Badge tone="slate">{workOrder.caseNumber}</Badge>
          <Badge tone={weatherTone((workOrder.weather?.severeRisk ?? "Low") as "Low" | "Moderate" | "High")}>
            {workOrder.weather?.severeRisk ?? "Low"} weather
          </Badge>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          {expanded ? "Less" : "More"}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-950">{workOrder.siteName}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>{workOrder.city}, {workOrder.state}</span>
        {workOrder.scheduledStart ? <span>{formatVisitDate(workOrder.scheduledStart)}</span> : null}
      </div>
      {workOrder.assignedTo ? <p className="mt-2 text-sm text-slate-700">Assigned to {workOrder.assignedTo}</p> : null}

      {!compactMode ? <p className="mt-3 text-sm leading-6 text-slate-700">{workOrder.shortDescription}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {primaryFlags.map((flag: string) => <Badge key={flag} tone={flagTone(flag)}>{flag}</Badge>)}
        {!primaryFlags.length ? <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">No blockers</span> : null}
      </div>

      {expanded ? (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          {compactMode ? <p className="text-sm leading-6 text-slate-700">{workOrder.shortDescription}</p> : null}

          <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-sky-900">
            Forecast: {workOrder.weather?.summary ?? "Unavailable"} | {workOrder.weather?.temperatureF ?? "--"}F | Risk {workOrder.weather?.severeRisk ?? "Low"}{workOrder.weatherSource ? ` | ${workOrder.weatherSource}` : ""}
          </div>

          {workOrder.nextStep ? (
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              {workOrder.nextStep}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {workOrder.flagSummary.slice(primaryFlags.length).map((flag: string) => <Badge key={flag} tone={flagTone(flag)}>{flag}</Badge>)}
            {workOrder.skillTags.map((skill: string) => <Badge key={skill} tone="slate">{skill}</Badge>)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ totalColumns }: { totalColumns: number }) {
  return (
    <div
      className="col-span-full flex min-h-[220px] items-center justify-center border-b border-slate-100 bg-white/80 px-6 py-10 text-center"
      style={{ gridColumn: `span ${totalColumns}` }}
    >
      <div className="max-w-md space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">No dispatch rows match</p>
        <p className="text-sm text-slate-600">Try clearing search terms or switching the region filter back to all regions.</p>
      </div>
    </div>
  );
}

function Cell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("border-b border-r border-slate-100 px-4 py-4", className)}>{children}</div>;
}

function flagTone(flag: string) {
  if (/approval|repeat/i.test(flag)) return "red" as const;
  if (/parts|remote|schedule/i.test(flag)) return "amber" as const;
  return "slate" as const;
}

function weatherTone(risk: "Low" | "Moderate" | "High") {
  if (risk === "High") return "red" as const;
  if (risk === "Moderate") return "amber" as const;
  return "green" as const;
}
