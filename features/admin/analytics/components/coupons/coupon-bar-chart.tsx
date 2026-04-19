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

import type { CouponRow } from "../../types";

type CouponBarChartProps = { coupons: CouponRow[] };

const chartConfig = {
  periodRedemptions: { label: "Redemptions", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

export function CouponBarChart({ coupons }: CouponBarChartProps) {
  const data = coupons
    .filter((c) => c.periodRedemptions > 0)
    .slice(0, 10)
    .map((c) => ({ name: c.name, periodRedemptions: c.periodRedemptions }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans font-semibold">
          Top Coupons by Redemptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 16 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={100}
              tick={{ fontSize: 12 }}
            />
            <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="periodRedemptions"
              fill="var(--color-periodRedemptions)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
