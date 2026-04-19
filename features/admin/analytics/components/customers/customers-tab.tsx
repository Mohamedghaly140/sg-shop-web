import {
  LucideActivity,
  LucideUserPlus,
  LucideUsers,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import type { CustomersAnalytics } from "../../types";
import { AnalyticsKpiCard } from "../analytics-kpi-card";
import { NewCustomersChart } from "./new-customers-chart";
import { TopSpendersTable } from "./top-spenders-table";

type CustomersTabProps = { data: CustomersAnalytics };

export function CustomersTab({ data }: CustomersTabProps) {
  return (
    <TabsContent value="customers" className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <AnalyticsKpiCard
          label="Total Customers"
          value={data.totalCustomers.toLocaleString("en-US")}
          icon={LucideUsers}
          description="All registered customers"
        />
        <AnalyticsKpiCard
          label="New This Period"
          value={data.newThisPeriod.toLocaleString("en-US")}
          icon={LucideUserPlus}
          description="Signed up in date range"
        />
        <AnalyticsKpiCard
          label="Active This Period"
          value={data.activeThisPeriod.toLocaleString("en-US")}
          icon={LucideActivity}
          description="Placed at least 1 order"
        />
      </div>

      <NewCustomersChart data={data.newCustomersOverTime} />

      <Card>
        <CardHeader>
          <CardTitle className="font-sans font-semibold">Top 10 Spenders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TopSpendersTable data={data.topSpenders} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
