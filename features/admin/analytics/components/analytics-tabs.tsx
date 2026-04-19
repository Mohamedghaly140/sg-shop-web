"use client";

import type { ReactNode } from "react";

import { TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";

import { useAnalyticsParams } from "../hooks/use-analytics-params";
import type { AnalyticsTab } from "../types";

const TABS: { value: AnalyticsTab; label: string }[] = [
  { value: "sales", label: "Sales" },
  { value: "products", label: "Products" },
  { value: "customers", label: "Customers" },
  { value: "coupons", label: "Coupons" },
  { value: "geography", label: "Geography" },
];

type AnalyticsTabsProps = { children: ReactNode };

export function AnalyticsTabs({ children }: AnalyticsTabsProps) {
  const [params, setParams] = useAnalyticsParams();

  return (
    <Tabs
      value={params.tab}
      onValueChange={(v) => setParams({ tab: v as AnalyticsTab })}
    >
      <TabsList className="mb-4 w-full justify-start">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
