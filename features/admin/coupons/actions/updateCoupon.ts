"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";

const baseCouponSchema = z.object({
  name: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers, and hyphens allowed"),
  discount: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .min(1, "Minimum discount is 1%")
        .max(70, "Maximum discount is 70%"),
    ),
  expire: z
    .string()
    .min(1, "Expiry date is required")
    .refine((v) => !isNaN(new Date(v).getTime()), "Invalid date format"),
  maxUsage: z
    .string()
    .transform(Number)
    .pipe(z.number().int("Must be a whole number").min(0, "Cannot be negative")),
});

const updateCouponSchema = baseCouponSchema.extend({
  couponId: z.string().min(1, "Coupon ID is required"),
});

export async function updateCouponAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const parsed = updateCouponSchema.parse({
      couponId: formData.get("couponId"),
      name: formData.get("name")?.toString().toUpperCase(),
      discount: formData.get("discount"),
      expire: formData.get("expire"),
      maxUsage: formData.get("maxUsage"),
    });

    await prisma.coupon.update({
      where: { id: parsed.couponId },
      data: {
        name: parsed.name,
        discount: parsed.discount,
        expire: new Date(parsed.expire),
        maxUsage: parsed.maxUsage,
      },
    });

    revalidatePath("/admin/coupons");
    return toActionState("SUCCESS", "Coupon updated successfully");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fromErrorToActionState(
        new Error(
          `Coupon code "${formData.get("name")?.toString().toUpperCase()}" already exists`,
        ),
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

