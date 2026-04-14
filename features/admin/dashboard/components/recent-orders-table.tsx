import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { RecentOrder } from "../types";

type Props = {
  orders: RecentOrder[];
};

const statusStyles: Record<string, string> = {
  PENDING: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
  PROCESSING: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  SHIPPED: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  DELIVERED: "border-green-500/30 bg-green-500/10 text-green-500",
  CANCELLED: "border-red-500/30 bg-red-500/10 text-red-500",
  REFUNDED: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export function RecentOrdersTable({ orders }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-sans font-semibold">Recent Orders</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No orders yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:underline"
                    >
                      {order.humanOrderId}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate text-sm">
                    {order.customerName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        statusStyles[order.status] ?? "",
                      )}
                    >
                      {statusLabels[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {order.totalOrderPrice != null
                      ? `EGP ${order.totalOrderPrice.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {format(order.createdAt, "MMM d")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
