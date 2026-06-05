"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartEmpty } from "@/components/charts/chart-empty";

export interface WorkloadDatum {
  name: string;
  value: number;
}

const config = {
  value: { label: "Allocation %", color: "var(--chart-1)" },
} satisfies ChartConfig;

function loadColor(pct: number): string {
  if (pct > 100) return "var(--rag-red)";
  if (pct >= 85) return "var(--rag-amber)";
  return "var(--rag-green)";
}

/**
 * Horizontal resource workload chart. Bars are coloured by utilisation, with a
 * 100% capacity reference line so over-allocation is obvious.
 */
export function WorkloadBar({
  data,
  className,
}: {
  data: WorkloadDatum[];
  className?: string;
}) {
  if (!data.length) {
    return <ChartEmpty message="No resource allocations" className={className} />;
  }

  const maxValue = Math.max(100, ...data.map((d) => d.value));

  return (
    <ChartContainer config={config} className={className ?? "aspect-[4/3] w-full"}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={[0, maxValue]}
          tickLine={false}
          axisLine={false}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ReferenceLine x={100} stroke="var(--rag-red)" strokeDasharray="4 4" />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell key={index} fill={loadColor(entry.value)} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(value) => `${value}%`}
            className="fill-foreground text-xs"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
