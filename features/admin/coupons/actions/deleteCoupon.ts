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

export async function deleteCouponAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const { couponId } = couponIdSchema.parse({
      couponId: formData.get("couponId"),
    });

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: { usedCount: true },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    if (coupon.usedCount > 0) {
      throw new Error("Used coupons cannot be deleted. Deactivate this coupon instead.");
    }

    await prisma.coupon.delete({ where: { id: couponId } });

    revalidatePath("/admin/coupons");
    return toActionState("SUCCESS", "Coupon deleted successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
