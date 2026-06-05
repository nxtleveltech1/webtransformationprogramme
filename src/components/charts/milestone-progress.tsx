"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { ChartEmpty } from "@/components/charts/chart-empty";

export interface MilestoneStatusDatum {
  name: string;
  value: number;
  fill?: string;
}

const config = {
  value: { label: "Milestones", color: "var(--chart-1)" },
} satisfies ChartConfig;

/**
 * Milestone progress: an overall completion bar plus a breakdown of milestone
 * counts by status.
 */
export function MilestoneProgress({
  data,
  percentComplete,
  className,
}: {
  data: MilestoneStatusDatum[];
  percentComplete?: number;
  className?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (!data.length || total === 0) {
    return <ChartEmpty message="No milestones to track" className={className} />;
  }

  return (
    <div className="space-y-4">
      {typeof percentComplete === "number" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall completion</span>
            <span className="font-medium tabular-nums">{percentComplete}%</span>
          </div>
          <Progress value={percentComplete} aria-label="Milestone completion" />
        </div>
      )}
      <ChartContainer config={config} className={className ?? "aspect-[5/3] w-full"}>
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
    </div>
  );
}
