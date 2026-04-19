import { LucideMapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";

import type { GeographyAnalytics } from "../../types";
import { AnalyticsKpiCard } from "../analytics-kpi-card";
import { GeographyChart } from "./geography-chart";

function fmtEGP(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

type GeographyTabProps = { data: GeographyAnalytics };

export function GeographyTab({ data }: GeographyTabProps) {
  const totalOrders = data.rows.reduce((sum, r) => sum + r.orderCount, 0);

  return (
    <TabsContent value="geography" className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <AnalyticsKpiCard
          label="Governorates Served"
          value={data.rows.length.toLocaleString("en-US")}
          icon={LucideMapPin}
          description="In selected period"
        />
        <AnalyticsKpiCard
          label="Total Orders"
          value={totalOrders.toLocaleString("en-US")}
          icon={LucideMapPin}
          description="With location data"
        />
      </div>

      <GeographyChart data={data.rows} />

      <Card>
        <CardHeader>
          <CardTitle className="font-sans font-semibold">All Regions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Governorate</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No location data for this period
                  </TableCell>
                </TableRow>
              )}
              {data.rows.map((row, i) => (
                <TableRow key={row.governorate}>
                  <TableCell className="font-medium text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{row.governorate}</TableCell>
                  <TableCell className="text-right">
                    {row.orderCount.toLocaleString("en-US")}
                  </TableCell>
                  <TableCell className="text-right">{fmtEGP(row.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
