import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatus } from "@/generated/prisma/client";
import type { CustomerDetail } from "../services/get-customer";

type CustomerStatsCardProps = {
  customer: Pick<CustomerDetail, "createdAt" | "orders">;
};

export function CustomerStatsCard({ customer }: CustomerStatsCardProps) {
  const completedOrders = customer.orders.filter(
    (o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REFUNDED
  );
  const totalSpent = completedOrders.reduce(
    (sum, o) => sum + Number(o.totalOrderPrice),
    0
  );

  const stats = [
    { label: "Total Orders", value: String(customer.orders.length) },
    { label: "Total Spent", value: `EGP ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
    { label: "Member Since", value: format(customer.createdAt, "MMM yyyy") },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
