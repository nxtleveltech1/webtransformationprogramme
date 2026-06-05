"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartEmpty } from "@/components/charts/chart-empty";

export interface AgeingDatum {
  bucket: string;
  count: number;
}

const config = {
  count: { label: "Issues", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** Bars deepen towards red as the age bucket increases. */
const BUCKET_COLORS = [
  "var(--rag-green)",
  "var(--chart-2)",
  "var(--rag-amber)",
  "var(--rag-red)",
  "var(--rag-red)",
];

/**
 * Issue ageing histogram. Buckets are precomputed (e.g. from createdAt) and
 * passed in order from newest to oldest.
 */
export function IssueAgeing({
  data,
  className,
}: {
  data: AgeingDatum[];
  className?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (!data.length || total === 0) {
    return <ChartEmpty message="No issues to age" className={className} />;
  }

  return (
    <ChartContainer config={config} className={className ?? "aspect-[4/3] w-full"}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="bucket" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={BUCKET_COLORS[Math.min(index, BUCKET_COLORS.length - 1)]}
            />
          ))}
          <LabelList
            dataKey="count"
            position="top"
            className="fill-foreground text-xs"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
