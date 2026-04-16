import { Suspense } from "react";
import { ScopeBuilderView } from "@/components/scopes/scope-builder-view";
import { AppShell } from "@/components/shared/app-shell";

export default function ScopeBuilderPage() {
  return (
    <AppShell currentPath="/scope-builder">
      <Suspense fallback={null}>
        <ScopeBuilderView />
      </Suspense>
    </AppShell>
  );
}
