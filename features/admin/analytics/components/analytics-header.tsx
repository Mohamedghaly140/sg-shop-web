"use client";

import { useAnalyticsParams } from "../hooks/use-analytics-params";
import { DateRangePicker } from "./date-range-picker";

export function AnalyticsHeader() {
  const [params, setParams] = useAnalyticsParams();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Detailed reports and insights for your store
        </p>
      </div>
      <DateRangePicker
        from={params.from}
        to={params.to}
        onChange={(from, to) => setParams({ from, to })}
      />
    </div>
  );
}
