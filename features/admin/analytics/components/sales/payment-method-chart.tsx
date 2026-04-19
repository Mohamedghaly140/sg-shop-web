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

type PaymentMethodChartProps = {
  data: { method: string; count: number }[];
};

const chartConfig = {
  CASH: { label: "Cash on Delivery", color: "hsl(var(--chart-2))" },
  CARD: { label: "Card", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  const chartData = data.map((row) => ({
    method: row.method,
    count: row.count,
    fill: row.method === "CASH"
      ? "hsl(var(--chart-2))"
      : "hsl(var(--chart-1))",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans font-semibold">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="method" hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="method"
              innerRadius={55}
              outerRadius={80}
            />
            <ChartLegend content={<ChartLegendContent nameKey="method" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
