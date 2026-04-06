import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getValidationQueue } from "@/lib/data/repository";
import { formatPercent } from "@/lib/utils";

export function ValidationOverview() {
  const queue = getValidationQueue();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Validation"
        title="Scope-to-project alignment review"
        description="This starter panel frames the future BOM and sold-scope comparison workflow around explainable findings, confidence, and reviewer notes."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {queue.map((item) => (
          <Card key={item.id} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{item.caseNumber}</p>
                <h3 className="text-xl font-semibold text-slate-950">{item.projectName}</h3>
                <p className="text-sm text-slate-600">{item.client}</p>
              </div>
              <Badge tone={item.verdict === "Aligned" ? "green" : item.verdict === "Possibly Aligned" ? "amber" : "red"}>
                {item.verdict}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{formatPercent(item.confidence)} confidence</p>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Missing BOM References</p>
              <p className="mt-2 text-sm text-slate-700">
                {item.missingBomItems.length ? item.missingBomItems.join(", ") : "No missing BOM items detected."}
              </p>
            </div>
            <div className="space-y-2">
              {item.reviewerNotes.map((note) => (
                <div key={note} className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
                  {note}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
