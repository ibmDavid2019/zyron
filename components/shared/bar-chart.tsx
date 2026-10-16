"use client";

import { cn } from "@/lib/utils";

interface BarChartProps {
  data: { label: string; value: number; highlighted?: boolean }[];
  valueFormatter?: (value: number) => string;
  className?: string;
  barClassName?: string;
}

export function BarChart({ data, valueFormatter, className, barClassName }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("flex items-end justify-between gap-1.5 sm:gap-2.5", className)}>
      {data.map((point, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {valueFormatter ? valueFormatter(point.value) : point.value}
          </span>
          <div className="flex h-24 w-full max-w-8 items-end overflow-hidden rounded-md bg-muted sm:h-32">
            <div
              className={cn(
                "w-full rounded-md transition-all",
                point.highlighted ? "bg-brand" : "bg-brand/30 group-hover:bg-brand/50",
                barClassName
              )}
              style={{ height: `${Math.max((point.value / max) * 100, point.value > 0 ? 4 : 0)}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">{point.label}</span>
        </div>
      ))}
    </div>
  );
}
