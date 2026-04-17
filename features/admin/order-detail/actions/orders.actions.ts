"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { OrderStatus, PaymentMethod } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";

async function requireManagerOrAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

const updateStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

const togglePaidSchema = z.object({
  orderId: z.string().min(1),
});

export async function updateOrderStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const parsed = updateStatusSchema.parse({
      orderId: formData.get("orderId"),
      status: formData.get("status"),
      notes: formData.get("notes") ?? undefined,
    });

    const isDelivered = parsed.status === OrderStatus.DELIVERED;

    await prisma.order.update({
      where: { id: parsed.orderId },
      data: {
        status: parsed.status,
        notes: parsed.notes ?? undefined,
        ...(isDelivered
          ? { isDelivered: true, deliveredAt: new Date() }
          : {}),
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${parsed.orderId}`);
    return toActionState("SUCCESS", "Order status updated");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

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
