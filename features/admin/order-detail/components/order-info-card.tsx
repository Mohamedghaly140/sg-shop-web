"use client";

import { useActionState } from "react";
import { format } from "date-fns";
import { LucideCreditCard, LucideBanknote, LucideTag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Form from "@/components/shared/form/form";
import SubmitButton from "@/components/shared/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { PaymentMethod } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { togglePaidAction } from "../actions/orders.actions";
import type { OrderDetail } from "../services/get-order";

type OrderInfoCardProps = {
  order: Pick<
    OrderDetail,
    | "id"
    | "paymentMethod"
    | "isPaid"
    | "paidAt"
    | "shippingFees"
    | "totalOrderPrice"
    | "discountApplied"
    | "coupon"
    | "createdAt"
    | "updatedAt"
    | "notes"
  >;
};

export function OrderInfoCard({ order }: OrderInfoCardProps) {
  const [actionState, formAction] = useActionState(togglePaidAction, EMPTY_ACTION_STATE);

  const subtotal =
    order.totalOrderPrice != null && order.shippingFees != null
      ? Number(order.totalOrderPrice) - Number(order.shippingFees) + (order.discountApplied ? Number(order.discountApplied) : 0)
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          {subtotal != null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>EGP {subtotal.toFixed(2)}</span>
            </div>
          )}
          {order.discountApplied && Number(order.discountApplied) > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <LucideTag className="w-3 h-3" />
                {order.coupon ? `Coupon (${order.coupon.name})` : "Discount"}
              </span>
              <span>- EGP {Number(order.discountApplied).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {Number(order.shippingFees) === 0
                ? "Free"
                : `EGP ${Number(order.shippingFees).toFixed(2)}`}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>
              {order.totalOrderPrice != null
                ? `EGP ${Number(order.totalOrderPrice).toFixed(2)}`
                : "—"}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              {order.paymentMethod === PaymentMethod.CARD ? (
                <LucideCreditCard className="w-3.5 h-3.5" />
              ) : (
                <LucideBanknote className="w-3.5 h-3.5" />
              )}
              Payment
            </span>
            <span>{order.paymentMethod === PaymentMethod.CARD ? "Card" : "Cash on Delivery"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment status</span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                order.isPaid
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-amber-100 text-amber-800 border-amber-200",
              )}
            >
              {order.isPaid ? "Paid" : "Unpaid"}
            </Badge>
          </div>
          {order.paidAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid at</span>
              <span className="text-xs">{format(order.paidAt, "MMM d, yyyy HH:mm")}</span>
            </div>
          )}
        </div>

        {order.paymentMethod === PaymentMethod.CASH && (
          <Form action={formAction} actionState={actionState}>
            <input type="hidden" name="orderId" value={order.id} />
            <SubmitButton
              label={order.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
              variant={order.isPaid ? "outline" : "default"}
              size="sm"
              className="w-full"
            />
          </Form>
        )}

        {order.notes && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Notes</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          </>
        )}

        <Separator />
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Placed</span>
            <span>{format(order.createdAt, "MMM d, yyyy HH:mm")}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated</span>
            <span>{format(order.updatedAt, "MMM d, yyyy HH:mm")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
