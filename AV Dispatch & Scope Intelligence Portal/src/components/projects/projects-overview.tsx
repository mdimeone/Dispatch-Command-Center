import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProjects } from "@/lib/data/repository";

export function ProjectsOverview() {
  const items = getProjects();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Projects"
        title="Reference context for sold intent"
        description="This project slice becomes the future home for BOM context, original sold scope, and reference data linked into review workflows."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((project) => (
          <Card key={project.id} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{project.phase}</p>
            <h3 className="text-xl font-semibold text-slate-950">{project.name}</h3>
            <p className="text-sm text-slate-600">{project.clientName}</p>
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              {project.soldScopeSummary}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
