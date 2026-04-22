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
import { revalidateProductCaches } from "./productActionHelpers";

const featuredSchema = z.object({
  productId: z.string().min(1),
  featured: z.enum(["true", "false"]),
});

export async function toggleFeaturedAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const { productId, featured } = featuredSchema.parse({
      productId: formData.get("productId"),
      featured: formData.get("featured"),
    });

    await prisma.product.update({
      where: { id: productId },
      data: { featured: featured === "true" },
    });

    revalidateProductCaches();
    revalidatePath(`/admin/products/${productId}`);
    return toActionState(
      "SUCCESS",
      featured === "true" ? "Product featured" : "Product unfeatured",
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
