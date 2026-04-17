import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/generated/prisma/client";
import { getOrder } from "./services/get-order";
import { OrderItemsTable } from "./components/order-items-table";
import { OrderStatusStepper } from "./components/order-status-stepper";
import { OrderInfoCard } from "./components/order-info-card";
import { OrderCustomerCard } from "./components/order-customer-card";
import { OrderShippingCard } from "./components/order-shipping-card";
import { UpdateOrderStatusDialog } from "./components/update-order-status-dialog";

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  PENDING:    "bg-amber-100 text-amber-800 border-amber-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED:    "bg-indigo-100 text-indigo-800 border-indigo-200",
  DELIVERED:  "bg-green-100 text-green-800 border-green-200",
  CANCELLED:  "bg-red-100 text-red-800 border-red-200",
  REFUNDED:   "bg-orange-100 text-orange-800 border-orange-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

type AdminOrderDetailFeatureProps = {
  id: string;
};

export default async function AdminOrderDetailFeature({ id }: AdminOrderDetailFeatureProps) {
  const order = await getOrder(id);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <LucideArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{order.humanOrderId}</h1>
              <Badge
                variant="outline"
                className={cn("text-xs font-medium", STATUS_BADGE_CLASS[order.status])}
              >
                {STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <UpdateOrderStatusDialog
          orderId={order.id}
          currentStatus={order.status}
          currentNotes={order.notes}
        />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <OrderItemsTable items={order.items} />
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">
              Order Progress
            </p>
            <OrderStatusStepper status={order.status} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <OrderInfoCard order={order} />
          <OrderCustomerCard order={order} />
          <OrderShippingCard order={order} />
        </div>
      </div>
    </div>
  );
}
