"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";

const toggleActiveSchema = z.object({
  customerId: z.string().min(1),
  active: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export async function toggleCustomerActiveAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const currentUserId = await requireManagerOrAdmin();

    const { customerId, active } = toggleActiveSchema.parse({
      customerId: formData.get("customerId"),
      active: formData.get("active"),
    });

    if (customerId === currentUserId) {
      throw new Error("You cannot change your own active state");
    }

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { role: true },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.role !== Role.USER) {
      throw new Error("Only customer accounts can be activated or deactivated here");
    }

    const clerk = await clerkClient();
    if (active) {
      await clerk.users.unbanUser(customerId);
    } else {
      await clerk.users.banUser(customerId);
    }

    await prisma.user.update({
      where: { id: customerId },
      data: { active },
    });

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${customerId}`);

    return toActionState(
      "SUCCESS",
      active ? "Customer activated" : "Customer deactivated",
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
