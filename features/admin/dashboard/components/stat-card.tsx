import { LucideMinus, LucideTrendingDown, LucideTrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  label: string;
  value: string;
  current: number;
  previous: number;
  icon: LucideIcon;
};

function calcTrend(current: number, previous: number) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function StatCard({ label, value, current, previous, icon: Icon }: Props) {
  const trend = calcTrend(current, previous);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-3xl font-semibold tracking-tight">{value}</p>
        <div className="mt-2 flex items-center gap-1 text-xs">
          {trend === null ? (
            <span className="text-muted-foreground">No previous data</span>
          ) : trend > 0 ? (
            <>
              <LucideTrendingUp className="h-3 w-3 text-green-500" />
              <Badge
                variant="outline"
                className="border-green-500/30 bg-green-500/10 px-1 py-0 text-xs text-green-500"
              >
                +{trend.toFixed(1)}%
              </Badge>
              <span className="text-muted-foreground">vs last month</span>
            </>
          ) : trend < 0 ? (
            <>
              <LucideTrendingDown className="h-3 w-3 text-red-500" />
              <Badge
                variant="outline"
                className="border-red-500/30 bg-red-500/10 px-1 py-0 text-xs text-red-500"
              >
                {trend.toFixed(1)}%
              </Badge>
              <span className="text-muted-foreground">vs last month</span>
            </>
          ) : (
            <>
              <LucideMinus className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">No change vs last month</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
