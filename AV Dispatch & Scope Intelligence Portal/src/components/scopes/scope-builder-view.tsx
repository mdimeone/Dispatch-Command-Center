import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDispatches } from "@/lib/data/repository";
import { formatPercent } from "@/lib/utils";

export function ScopeBuilderView() {
  const focusDispatch = getDispatches()[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Scope Builder"
          title="Structured drafting with AI-ready sections"
          description="This starter experience models the future workflow: guided sections, source context, version history, and action buttons for generation and rewriting."
        />

        <Card className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="sky">{focusDispatch.caseNumber}</Badge>
            <Badge tone="amber">{focusDispatch.status}</Badge>
            <Badge tone="slate">{formatPercent(focusDispatch.scope.confidence)} confidence</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Client / Site</p>
              <p className="mt-2 font-semibold text-slate-950">{focusDispatch.client.name}</p>
              <p className="text-sm text-slate-600">{focusDispatch.site.name}</p>
              <p className="mt-2 text-sm text-slate-600">{focusDispatch.site.accessNotes}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Workflow Signals</p>
              <p className="mt-2 text-sm text-slate-700">
                Validation verdict: {focusDispatch.validation.verdict}
              </p>
              <p className="mt-1 text-sm text-slate-700">Traffic risk: {focusDispatch.traffic.routeRisk}</p>
              <p className="mt-1 text-sm text-slate-700">Weather risk: {focusDispatch.weather.severeRisk}</p>
            </div>
          </div>

          <div className="space-y-4">
            {focusDispatch.scope.sections.map((section) => (
              <div key={section.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-950">{section.title}</h3>
                  <button className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
                    <Sparkles className="h-4 w-4" />
                    AI assist
                  </button>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">{section.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-4 bg-slate-950 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-200">AI Actions</p>
          <div className="grid gap-3">
            {[
              "Draft scope from case and notes",
              "Rewrite for clarity",
              "Generate client-facing version",
              "Create reviewer checklist"
            ].map((action) => (
              <button
                key={action}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10"
              >
                {action}
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Version History</p>
          {focusDispatch.scope.versions.map((version) => (
            <div key={version.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-950">{version.label}</p>
              <p className="mt-1 text-sm text-slate-600">{version.updatedBy}</p>
              <p className="text-xs text-slate-500">{version.updatedAt}</p>
            </div>
          ))}
        </Card>

        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Suggested Guardrails</p>
          {focusDispatch.validation.reviewerNotes.map((note) => (
            <div key={note} className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
              {note}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
