"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type OrdersStatusChartProps = {
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

export function OrdersStatusChart({ data }: OrdersStatusChartProps) {
  const chartData = data.map((row) => {
    const key = row.status.toLowerCase();
    return {
      status: STATUS_LABELS[key] ?? key,
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
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
