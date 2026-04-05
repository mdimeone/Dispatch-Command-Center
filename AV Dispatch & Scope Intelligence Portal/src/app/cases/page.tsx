import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDispatches } from "@/lib/data/repository";

export default function CasesPage() {
  const cases = getDispatches();

  return (
    <AppShell currentPath="/cases">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Cases"
          title="Case queue and visit history"
          description="A compact case surface showing the operational context that feeds dispatch and scope generation."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {cases.map((item) => (
            <Card key={item.id}>
              <p className="text-sm text-slate-500">{item.caseNumber}</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">{item.projectName}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.visitPurpose}</p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p>Client: {item.client.name}</p>
                <p>Site: {item.site.name}</p>
                <p>Supervisor: {item.supervisor}</p>
              </div>
              <div className="mt-4 space-y-2">
                {item.notes.map((note) => (
                  <div key={note} className="rounded-2xl bg-sky-50 p-3 text-sm text-sky-950">
                    {note}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
