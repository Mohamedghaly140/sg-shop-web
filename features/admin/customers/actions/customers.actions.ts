"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  formData: FormData
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const { customerId, active } = toggleActiveSchema.parse({
      customerId: formData.get("customerId"),
      active: formData.get("active"),
    });

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
      active ? "Customer activated" : "Customer deactivated"
    );
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
