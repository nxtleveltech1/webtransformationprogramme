"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartEmpty } from "@/components/charts/chart-empty";

export interface RagBarDatum {
  name: string;
  value: number;
  /** Optional explicit fill (CSS colour / var). Falls back to chart-1. */
  fill?: string;
}

const config = {
  value: { label: "Count", color: "var(--chart-1)" },
} satisfies ChartConfig;

/**
 * Generic categorical bar chart used for RAG distributions and other small
 * count-by-category breakdowns. Each bar may carry its own colour.
 */
export function RagBar({
  data,
  className,
  emptyMessage,
}: {
  data: RagBarDatum[];
  className?: string;
  emptyMessage?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (!data.length || total === 0) {
    return <ChartEmpty message={emptyMessage} className={className} />;
  }

  return (
    <ChartContainer config={config} className={className ?? "aspect-[4/3] w-full"}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill ?? "var(--color-value)"} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            className="fill-foreground text-xs"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
