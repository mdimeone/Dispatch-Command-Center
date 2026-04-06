import { AppShell } from "@/components/shared/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getReviewQueue } from "@/lib/data/repository";
import { formatPercent } from "@/lib/utils";

export default function ScopeReviewPage() {
  const queue = getReviewQueue();

  return (
    <AppShell currentPath="/scope-review">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Scope Review"
          title="Review-ready drafts and risk flags"
          description="A lightweight review queue for supervisor signoff, AI note inspection, and escalation handling."
        />

        <div className="space-y-4">
          {queue.map((item) => (
            <Card key={item.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{item.caseNumber}</p>
                  <h3 className="text-xl font-semibold text-slate-950">{item.projectName}</h3>
                </div>
                <div className="flex gap-2">
                  <Badge tone="sky">{item.scope.status}</Badge>
                  <Badge tone={item.validation.verdict === "Likely Out of Scope" ? "red" : "amber"}>
                    {item.validation.verdict}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-slate-700">
                Scope confidence: {formatPercent(item.scope.confidence)}
              </p>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Draft Sections</p>
                  <div className="mt-3 space-y-3">
                    {item.scope.sections.map((section) => (
                      <div key={section.id}>
                        <p className="font-medium text-slate-900">{section.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{section.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {item.validation.reviewerNotes.map((note) => (
                    <div key={note} className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
