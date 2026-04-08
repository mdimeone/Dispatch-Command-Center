"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type PanelSeverity = "Info" | "Warning" | "Action Needed" | "Blocked";

export interface UrgencyPanelItem {
  id: string;
  severity: PanelSeverity;
  label: string;
  source: string;
  nextStep: string;
}

export interface TimelinePanelItem {
  id: string;
  at?: string;
  title: string;
  detail: string;
  source: "Case" | "Work Order";
}

export interface DecisionPanelItem {
  id: string;
  title: string;
  tone: "green" | "amber" | "red";
  rows: [string, string][];
}

interface OperationalPanelProps {
  urgencyItems: UrgencyPanelItem[];
  timelineItems: TimelinePanelItem[];
  decisionItems: DecisionPanelItem[];
}

type ActiveTab = "urgency" | "decisions" | "timeline";
type PanelSelection =
  | { kind: "urgency"; item: UrgencyPanelItem }
  | { kind: "timeline"; item: TimelinePanelItem }
  | { kind: "decision"; item: DecisionPanelItem };

export function CaseOperationalPanel({
  urgencyItems,
  timelineItems,
  decisionItems
}: OperationalPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("urgency");
  const [showAllUrgency, setShowAllUrgency] = useState(false);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [selection, setSelection] = useState<PanelSelection | null>(null);

  const visibleUrgency = useMemo(
    () => (showAllUrgency ? urgencyItems : urgencyItems.slice(0, 3)),
    [showAllUrgency, urgencyItems]
  );
  const visibleTimeline = useMemo(
    () => (showAllTimeline ? timelineItems : timelineItems.slice(0, 5)),
    [showAllTimeline, timelineItems]
  );

  return (
    <>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Operational Workspace</p>
          <div className="ml-auto flex gap-2">
            <TabButton active={activeTab === "urgency"} onClick={() => setActiveTab("urgency")} label="Urgency" />
            <TabButton active={activeTab === "decisions"} onClick={() => setActiveTab("decisions")} label="Decisions" />
            <TabButton active={activeTab === "timeline"} onClick={() => setActiveTab("timeline")} label="Timeline" />
          </div>
        </div>

        {activeTab === "urgency" ? (
          <div className="space-y-2">
            {visibleUrgency.length ? (
              visibleUrgency.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelection({ kind: "urgency", item })}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={toneForSeverity(item.severity)}>{item.severity}</Badge>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.source}</p>
                  <p className="mt-1 text-sm text-slate-700">{item.nextStep}</p>
                </button>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">No active urgency signals.</div>
            )}
            {urgencyItems.length > 3 ? (
              <button
                type="button"
                onClick={() => setShowAllUrgency((prev) => !prev)}
                className="text-sm font-semibold text-slate-700 underline-offset-2 hover:underline"
              >
                {showAllUrgency ? "Show less urgency items" : `View all urgency items (${urgencyItems.length})`}
              </button>
            ) : null}
          </div>
        ) : null}

        {activeTab === "decisions" ? (
          <div className="space-y-2">
            {decisionItems.map((panel) => (
              <button
                key={panel.id}
                type="button"
                onClick={() => setSelection({ kind: "decision", item: panel })}
                className="w-full rounded-2xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{panel.title}</p>
                  <Badge tone={panel.tone}>
                    {panel.tone === "green" ? "Stable" : panel.tone === "amber" ? "Watch" : "Blocked"}
                  </Badge>
                </div>
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  {panel.rows.slice(0, 2).map(([label, value], index) => (
                    <p key={`${label}-${index}`}>
                      <span className="font-medium text-slate-900">{label}:</span> {value}
                    </p>
                  ))}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {activeTab === "timeline" ? (
          <div className="space-y-2">
            {visibleTimeline.length ? (
              visibleTimeline.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelection({ kind: "timeline", item })}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={item.source === "Case" ? "sky" : "slate"}>{item.source}</Badge>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.at)}</p>
                  <p className="mt-1 text-sm text-slate-700">{item.detail}</p>
                </button>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">No timeline events available.</div>
            )}
            {timelineItems.length > 5 ? (
              <button
                type="button"
                onClick={() => setShowAllTimeline((prev) => !prev)}
                className="text-sm font-semibold text-slate-700 underline-offset-2 hover:underline"
              >
                {showAllTimeline ? "Show less timeline events" : `View all timeline events (${timelineItems.length})`}
              </button>
            ) : null}
          </div>
        ) : null}
      </Card>

      {selection ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setSelection(null)}
            aria-label="Close detail panel"
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-lg overflow-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Detail Panel</p>
              <button
                type="button"
                onClick={() => setSelection(null)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
            </div>

            {selection.kind === "urgency" ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={toneForSeverity(selection.item.severity)}>{selection.item.severity}</Badge>
                  <p className="text-lg font-semibold text-slate-900">{selection.item.label}</p>
                </div>
                <p className="text-sm text-slate-600">Source: {selection.item.source}</p>
                <PanelLine label="Recommended Next Step" value={selection.item.nextStep} />
              </div>
            ) : null}

            {selection.kind === "timeline" ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={selection.item.source === "Case" ? "sky" : "slate"}>{selection.item.source}</Badge>
                  <p className="text-lg font-semibold text-slate-900">{selection.item.title}</p>
                </div>
                <PanelLine label="Timestamp" value={formatDateTime(selection.item.at)} />
                <PanelLine label="Details" value={selection.item.detail} />
              </div>
            ) : null}

            {selection.kind === "decision" ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-slate-900">{selection.item.title}</p>
                  <Badge tone={selection.item.tone}>
                    {selection.item.tone === "green" ? "Stable" : selection.item.tone === "amber" ? "Watch" : "Blocked"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {selection.item.rows.map(([label, value], index) => (
                    <PanelLine key={`${label}-${index}`} label={label} value={value} />
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}

function TabButton({
  active,
  onClick,
  label
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-1 text-sm font-semibold transition ${
        active ? "border-slate-700 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function PanelLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-slate-700">
      <span className="font-medium text-slate-900">{label}:</span> {value}
    </p>
  );
}

function toneForSeverity(severity: PanelSeverity): "slate" | "sky" | "amber" | "red" {
  if (severity === "Blocked") {
    return "red";
  }

  if (severity === "Action Needed") {
    return "amber";
  }

  if (severity === "Warning") {
    return "sky";
  }

  return "slate";
}

function formatDateTime(value?: string) {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
