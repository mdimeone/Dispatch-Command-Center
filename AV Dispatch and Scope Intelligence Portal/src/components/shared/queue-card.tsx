import { Card } from "@/components/ui/card";
import { QueueItem } from "@/types/domain";

export function QueueCard({ item }: { item: QueueItem }) {
  return (
    <Card className="brand-header-band text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-100">{item.title}</p>
          <p className="mt-3 text-sm text-blue-50/90">{item.description}</p>
        </div>
        <div className="rounded-2xl bg-white/15 px-4 py-2 text-3xl font-semibold">{item.count}</div>
      </div>
    </Card>
  );
}
