import { ProjectsOverview } from "@/components/projects/projects-overview";
import { AppShell } from "@/components/shared/app-shell";

export default function ProjectsPage() {
  return (
    <AppShell currentPath="/projects">
      <ProjectsOverview />
    </AppShell>
  );
}
