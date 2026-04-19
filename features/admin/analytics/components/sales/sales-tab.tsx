import {
  LucideBanknote,
  LucidePercent,
  LucideShoppingCart,
  LucideTrendingUp,
} from "lucide-react";

import { TabsContent } from "@/components/ui/tabs";

import type { SalesAnalytics } from "../../types";
import { AnalyticsKpiCard } from "../analytics-kpi-card";
import { OrdersStatusChart } from "./orders-status-chart";
import { PaymentMethodChart } from "./payment-method-chart";
import { RevenueChart } from "./revenue-chart";

function fmtEGP(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

type SalesTabProps = { data: SalesAnalytics };

export function SalesTab({ data }: SalesTabProps) {
  return (
    <TabsContent value="sales" className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AnalyticsKpiCard
          label="Total Revenue"
          value={fmtEGP(data.totalRevenue)}
          icon={LucideBanknote}
          description="Excl. cancelled & refunded"
        />
        <AnalyticsKpiCard
          label="Total Orders"
          value={data.totalOrders.toLocaleString("en-US")}
          icon={LucideShoppingCart}
        />
        <AnalyticsKpiCard
          label="Avg Order Value"
          value={fmtEGP(data.avgOrderValue)}
          icon={LucideTrendingUp}
        />
        <AnalyticsKpiCard
          label="Discount Given"
          value={fmtEGP(data.totalDiscountApplied)}
          icon={LucidePercent}
          description="All orders in period"
        />
      </div>

      <RevenueChart data={data.revenueOverTime} grouping={data.grouping} />

      <div className="grid gap-4 lg:grid-cols-2">
        <OrdersStatusChart data={data.ordersByStatus} />
        <PaymentMethodChart data={data.paymentMethodSplit} />
      </div>
    </TabsContent>
  );
}
