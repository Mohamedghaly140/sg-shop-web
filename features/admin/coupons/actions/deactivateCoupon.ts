"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";

const couponIdSchema = z.object({
  couponId: z.string().min(1, "Coupon ID is required"),
});

export async function deactivateCouponAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const { couponId } = couponIdSchema.parse({
      couponId: formData.get("couponId"),
    });

    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });

    revalidatePath("/admin/coupons");
    return toActionState("SUCCESS", "Coupon deactivated successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

