"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Props = {
  data: { status: string; count: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(45, 90%, 55%)",
  processing: "hsl(220, 80%, 60%)",
  shipped: "hsl(260, 75%, 65%)",
  delivered: "hsl(142, 71%, 45%)",
  cancelled: "hsl(0, 84%, 58%)",
  refunded: "hsl(220, 15%, 55%)",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const chartConfig: ChartConfig = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([key, label]) => [
    key,
    { label, color: STATUS_COLORS[key] ?? "hsl(220, 15%, 55%)" },
  ]),
);

export function OrdersByStatusChart({ data }: Props) {
  const chartData = data.map((row) => {
    const key = row.status.toLowerCase();
    return {
      status: key,
      count: row.count,
      fill: STATUS_COLORS[key] ?? "hsl(220, 15%, 55%)",
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans font-semibold">Orders by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="status" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={90}
            />
            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
