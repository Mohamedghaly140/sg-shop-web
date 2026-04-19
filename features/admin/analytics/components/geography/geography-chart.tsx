"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import type { GovernorateRow } from "../../types";

type GeographyChartProps = { data: GovernorateRow[] };

const chartConfig = {
  orderCount: { label: "Orders", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function GeographyChart({ data }: GeographyChartProps) {
  const top = data.slice(0, 15);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans font-semibold">Orders by Governorate</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[350px] w-full"
        >
          <BarChart data={top} layout="vertical" margin={{ left: 0, right: 16 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="governorate"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={110}
              tick={{ fontSize: 12 }}
            />
            <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="orderCount"
              fill="var(--color-orderCount)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
