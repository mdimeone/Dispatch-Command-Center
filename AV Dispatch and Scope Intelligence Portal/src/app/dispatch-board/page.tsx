import { DispatchBoard } from "@/components/dispatch/dispatch-board";
import { AppShell } from "@/components/shared/app-shell";
import { getWeeklyDispatchBoardSnapshotWithWeather } from "@/lib/data/repository";

export default async function DispatchBoardPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const weekOffsetValue = Array.isArray(resolvedSearchParams.weekOffset)
    ? resolvedSearchParams.weekOffset[0]
    : resolvedSearchParams.weekOffset;
  const parsedWeekOffset = Number.parseInt(weekOffsetValue ?? "0", 10);
  const weekOffset = Number.isNaN(parsedWeekOffset) ? 0 : parsedWeekOffset;
  const snapshot = await getWeeklyDispatchBoardSnapshotWithWeather(7, weekOffset);

  return (
    <AppShell currentPath="/dispatch-board">
      <DispatchBoard snapshot={snapshot} weekOffset={weekOffset} />
    </AppShell>
  );
}
