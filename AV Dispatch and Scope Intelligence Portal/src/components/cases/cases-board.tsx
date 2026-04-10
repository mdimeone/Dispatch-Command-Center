"use client";

import Link from "next/link";
import type { Route as AppRoute } from "next";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ServiceCase, CaseRollup } from "@/types/domain";

type SortOption = "at-risk" | "newest" | "most-work-orders" | "priority";

export function CasesBoard({
  cases,
  rollups
}: {
  cases: ServiceCase[];
  rollups: CaseRollup[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [stateFilter, setStateFilter] = useState("All states");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [sortBy, setSortBy] = useState<SortOption>("at-risk");

  const rollupMap = useMemo(
    () => new Map(rollups.map((item) => [item.caseNumber, item])),
    [rollups]
  );

  const priorities = useMemo(
    () => ["All priorities", ...new Set(cases.map((item) => item.priority).filter(Boolean).sort())],
    [cases]
  );

  const states = useMemo(
    () => ["All states", ...new Set(cases.map((item) => item.state).filter(Boolean).sort())],
    [cases]
  );

  const regions = useMemo(
    () => [
      "All regions",
      ...new Set(cases.map((item) => item.site.region ?? item.site.state).filter(Boolean).sort())
    ],
    [cases]
  );

  const filteredCases = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = cases.filter((item) => {
      const rollup = rollupMap.get(item.caseNumber);
      const itemRegion = item.site.region ?? item.site.state;

      if (repeatOnly && !rollup?.hasRepeatDispatch) {
        return false;
      }

      if (priorityFilter !== "All priorities" && item.priority !== priorityFilter) {
        return false;
      }

      if (stateFilter !== "All states" && item.state !== stateFilter) {
        return false;
      }

      if (regionFilter !== "All regions" && itemRegion !== regionFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const signalTypes = item.caseSignals.map((signal) => signal.type).join(" ");
      const blob = [
        item.caseNumber,
        item.shortDescription,
        item.client.name,
        item.site.name,
        item.site.city,
        item.site.state,
        itemRegion,
        signalTypes
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(query);
    });

    return filtered.sort((a, b) => compareCases(a, b, sortBy, rollupMap));
  }, [cases, priorityFilter, regionFilter, repeatOnly, rollupMap, searchQuery, sortBy, stateFilter]);

  const repeatCaseCount = filteredCases.filter(
    (item) => rollupMap.get(item.caseNumber)?.hasRepeatDispatch
  ).length;
  const staleCaseCount = filteredCases.filter((item) => isStale48Plus(item.updatedAt)).length;
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    repeatOnly ||
    priorityFilter !== "All priorities" ||
    stateFilter !== "All states" ||
    regionFilter !== "All regions";

  function clearFilters() {
    setSearchQuery("");
    setRepeatOnly(false);
    setPriorityFilter("All priorities");
    setStateFilter("All states");
    setRegionFilter("All regions");
    setSortBy("at-risk");
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(5,minmax(0,1fr))]">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Case, site, city, or signal"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Priority</span>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            >
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">State</span>
            <select
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            >
              {states.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Region</span>
            <select
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            >
              {regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            >
              <option value="at-risk">At risk first</option>
              <option value="newest">Newest activity</option>
              <option value="most-work-orders">Most work orders</option>
              <option value="priority">Highest priority</option>
            </select>
          </label>
          <label className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={repeatOnly}
              onChange={(event) => setRepeatOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-300"
            />
            Repeat dispatch only
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Badge tone="slate">{filteredCases.length} of {cases.length} visible</Badge>
            <Badge tone="amber">{repeatCaseCount} repeat</Badge>
            <Badge tone={staleCaseCount > 0 ? "red" : "slate"}>{staleCaseCount} stale 48h+</Badge>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Clear all filters
          </button>
        </div>

        <p className="text-sm text-slate-600">
          Showing {filteredCases.length} of {cases.length} cases, including {repeatCaseCount} repeat-dispatch and {staleCaseCount} stale (48h+) cases.
        </p>
      </Card>

      {!filteredCases.length ? (
        <Card>
          <p className="text-base font-semibold text-slate-900">No cases match this filter set.</p>
          <p className="mt-1 text-sm text-slate-600">Try broadening search terms or clearing one filter.</p>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredCases.map((item) => {
          const rollup = rollupMap.get(item.caseNumber);
          const age = formatAging(item.updatedAt);
          const ageTone = ageHoursTone(item.updatedAt);
          const caseDetailHref = `/cases/${item.caseNumber}` as AppRoute;
          const scopeBuilderHref = buildScopeBuilderHref(item);

          return (
            <Card key={item.id}>
              <p className="text-sm text-slate-500">{item.caseNumber}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">{item.shortDescription}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {item.client.name} - {item.site.name}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="sky">{item.state}</Badge>
                <Badge tone="slate">{item.priority}</Badge>
                {rollup?.hasRepeatDispatch ? <Badge tone="amber">Repeat Dispatch</Badge> : null}
                {age ? <Badge tone={ageTone}>{age}</Badge> : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p>Open WOs: {rollup?.openWorkOrders ?? 0}</p>
                <p>Completed WOs: {rollup?.completedWorkOrders ?? 0}</p>
                <p>Repeat visits: {rollup?.repeatVisitCount ?? 0}</p>
                <p>Last update: {formatLastUpdated(item.updatedAt)}</p>
              </div>

              <div className="mt-4 space-y-2">
                {(item.caseSignals.length
                  ? item.caseSignals.map((signal) => {
                      const nextStep = signal.recommendation?.nextStep;
                      return `${signal.type} (${signal.severity})${nextStep ? `: ${nextStep}` : ""}`;
                    })
                  : [item.analysis?.summary ?? "No analysis summary yet."]).map((note) => (
                  <div key={note} className="rounded-2xl bg-sky-50 p-3 text-sm text-sky-950">
                    {note}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={caseDetailHref}
                  className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open case detail
                </Link>
                <Link
                  href="/dispatch-board"
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Dispatch board
                </Link>
                <Link
                  href="/scope-review"
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Scope review
                </Link>
                <Link
                  href={scopeBuilderHref}
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Scope builder
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function compareCases(
  left: ServiceCase,
  right: ServiceCase,
  sortBy: SortOption,
  rollupMap: Map<string, CaseRollup>
) {
  if (sortBy === "newest") {
    return toTime(right.updatedAt) - toTime(left.updatedAt);
  }

  if (sortBy === "most-work-orders") {
    return (
      (rollupMap.get(right.caseNumber)?.totalWorkOrders ?? 0) -
      (rollupMap.get(left.caseNumber)?.totalWorkOrders ?? 0)
    );
  }

  if (sortBy === "priority") {
    return priorityRank(left.priority) - priorityRank(right.priority);
  }

  const riskDelta = riskScore(right, rollupMap) - riskScore(left, rollupMap);
  if (riskDelta !== 0) {
    return riskDelta;
  }
  return toTime(right.updatedAt) - toTime(left.updatedAt);
}

function riskScore(item: ServiceCase, rollupMap: Map<string, CaseRollup>) {
  const severityScore = item.caseSignals.reduce((score, signal) => {
    if (signal.severity === "Blocked") {
      return score + 4;
    }
    if (signal.severity === "Action Needed") {
      return score + 3;
    }
    if (signal.severity === "Warning") {
      return score + 2;
    }
    return score + 1;
  }, 0);

  const rollup = rollupMap.get(item.caseNumber);
  const repeatScore = rollup?.hasRepeatDispatch ? 3 : 0;
  const openWorkOrderScore = Math.min(rollup?.openWorkOrders ?? 0, 4);

  return severityScore + repeatScore + openWorkOrderScore;
}

function priorityRank(priority: string) {
  const parsed = Number.parseInt(priority, 10);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }
  return 99;
}

function toTime(value?: string) {
  if (!value) {
    return 0;
  }
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatLastUpdated(value?: string) {
  if (!value) {
    return "Unknown";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatAging(value?: string) {
  if (!value) {
    return null;
  }
  const updated = new Date(value).getTime();
  if (Number.isNaN(updated)) {
    return null;
  }

  const diffHours = Math.floor((Date.now() - updated) / 3_600_000);
  if (diffHours < 24) {
    return null;
  }
  if (diffHours < 48) {
    return "24h+ stale";
  }
  if (diffHours < 72) {
    return "48h+ stale";
  }
  return "72h+ stale";
}

function ageHoursTone(value?: string): "slate" | "amber" | "red" {
  if (!value) {
    return "slate";
  }
  const updated = new Date(value).getTime();
  if (Number.isNaN(updated)) {
    return "slate";
  }
  const diffHours = Math.floor((Date.now() - updated) / 3_600_000);
  if (diffHours >= 72) {
    return "red";
  }
  if (diffHours >= 24) {
    return "amber";
  }
  return "slate";
}

function isStale48Plus(value?: string) {
  if (!value) {
    return false;
  }
  const updated = new Date(value).getTime();
  if (Number.isNaN(updated)) {
    return false;
  }
  const diffHours = Math.floor((Date.now() - updated) / 3_600_000);
  return diffHours >= 48;
}

function buildScopeBuilderHref(item: ServiceCase): AppRoute {
  const params = new URLSearchParams({
    case: item.caseNumber,
    client: item.client.name,
    site: item.site.name,
    city: item.site.address?.city ?? item.site.city ?? "",
    state: item.site.address?.stateOrProvince ?? item.site.state ?? "",
    address: formatSiteAddress(item),
    contactName: item.primaryContact?.name ?? "",
    contactEmail: item.primaryContact?.email ?? "",
    contactPhone: item.primaryContact?.mobilePhone ?? item.primaryContact?.businessPhone ?? ""
  });
  return `/scope-builder?${params.toString()}` as AppRoute;
}

function formatSiteAddress(item: ServiceCase) {
  const address = item.site.address;
  if (!address) {
    return "";
  }
  return `${address.street}, ${address.city}, ${address.stateOrProvince} ${address.postalCode}`.trim();
}
