import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin"
        title="Data source and workflow controls"
        description="A placeholder admin surface for file uploads, connector settings, AI policy controls, and future role management."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Data Connectors",
            body: "Sample mode is active. Excel upload and mapping screens should land here next."
          },
          {
            title: "AI Policies",
            body: "Guardrails, prompt versions, and review requirements can be configured here."
          },
          {
            title: "Automation",
            body: "Trigger definitions, audit logs, and notification routing belong in this slice."
          }
        ].map((card) => (
          <Card key={card.title}>
            <h3 className="text-xl font-semibold text-slate-950">{card.title}</h3>
            <p className="mt-3 text-sm text-slate-600">{card.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
