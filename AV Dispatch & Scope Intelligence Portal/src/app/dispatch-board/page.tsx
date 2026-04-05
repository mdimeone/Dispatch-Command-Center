import { DispatchBoard } from "@/components/dispatch/dispatch-board";
import { AppShell } from "@/components/shared/app-shell";

export default function DispatchBoardPage() {
  return (
    <AppShell currentPath="/dispatch-board">
      <DispatchBoard />
    </AppShell>
  );
}
