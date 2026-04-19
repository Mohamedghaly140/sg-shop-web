import {
  LucideBadgePercent,
  LucideReceipt,
  LucideTicket,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import type { CouponsAnalytics } from "../../types";
import { AnalyticsKpiCard } from "../analytics-kpi-card";
import { CouponBarChart } from "./coupon-bar-chart";
import { CouponUsageTable } from "./coupon-usage-table";

function fmtEGP(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

type CouponsTabProps = { data: CouponsAnalytics };

export function CouponsTab({ data }: CouponsTabProps) {
  return (
    <TabsContent value="coupons" className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <AnalyticsKpiCard
          label="Total Coupons"
          value={data.totalCoupons.toLocaleString("en-US")}
          icon={LucideTicket}
          description="All time"
        />
        <AnalyticsKpiCard
          label="Period Redemptions"
          value={data.totalRedemptions.toLocaleString("en-US")}
          icon={LucideReceipt}
          description="In selected date range"
        />
        <AnalyticsKpiCard
          label="Discount Given"
          value={fmtEGP(data.totalDiscountGiven)}
          icon={LucideBadgePercent}
          description="In selected date range"
        />
      </div>

      <CouponBarChart coupons={data.coupons} />

      <Card>
        <CardHeader>
          <CardTitle className="font-sans font-semibold">All Coupons</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CouponUsageTable coupons={data.coupons} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
