"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ProductStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";
import { revalidateProductCaches } from "./productActionHelpers";

const statusSchema = z.object({
  productId: z.string().min(1),
  status: z.nativeEnum(ProductStatus),
});

export async function updateProductStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const { productId, status } = statusSchema.parse({
      productId: formData.get("productId"),
      status: formData.get("status"),
    });

    await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    revalidateProductCaches();
    revalidatePath(`/admin/products/${productId}`);
    return toActionState("SUCCESS", `Product marked as ${status.toLowerCase()}`);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
