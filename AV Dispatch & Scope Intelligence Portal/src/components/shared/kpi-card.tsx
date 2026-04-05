import { Card } from "@/components/ui/card";
import { DashboardMetric } from "@/types/domain";
import { cn } from "@/lib/utils";

const toneClasses = {
  default: "from-white to-slate-50",
  positive: "from-emerald-50 to-white",
  warning: "from-amber-50 to-white",
  danger: "from-rose-50 to-white"
};

export function KpiCard({ metric }: { metric: DashboardMetric }) {
  return (
    <Card className={cn("bg-gradient-to-br", toneClasses[metric.tone])}>
      <p className="text-sm text-slate-500">{metric.label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-4xl font-semibold text-slate-950">{metric.value}</p>
        <p className="max-w-[10rem] text-right text-xs text-slate-500">{metric.detail}</p>
      </div>
    </Card>
  );
}
