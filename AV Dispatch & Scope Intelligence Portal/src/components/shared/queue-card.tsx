import { Card } from "@/components/ui/card";
import { QueueItem } from "@/types/domain";

export function QueueCard({ item }: { item: QueueItem }) {
  return (
    <Card className="bg-slate-950 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-200">{item.title}</p>
          <p className="mt-3 text-sm text-slate-300">{item.description}</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-2 text-3xl font-semibold">{item.count}</div>
      </div>
    </Card>
  );
}
