"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { PaymentMethod } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";

const togglePaidSchema = z.object({
  orderId: z.string().min(1),
});

export async function togglePaidAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const { orderId } = togglePaidSchema.parse({ orderId: formData.get("orderId") });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { isPaid: true, paymentMethod: true },
    });

    if (!order) throw new Error("Order not found");
    if (order.paymentMethod !== PaymentMethod.CASH) {
      throw new Error("Cannot manually toggle payment for card orders");
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: !order.isPaid,
        paidAt: !order.isPaid ? new Date() : null,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return toActionState("SUCCESS", `Order marked as ${!order.isPaid ? "paid" : "unpaid"}`);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
