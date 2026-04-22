"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { destroyAsset } from "@/lib/cloudinary";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";

const deleteImageSchema = z.object({
  productId: z.string().min(1),
  productImageId: z.string().min(1),
});

export async function deleteProductImageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const { productId, productImageId } = deleteImageSchema.parse({
      productId: formData.get("productId"),
      productImageId: formData.get("productImageId"),
    });

    const image = await prisma.productImage.findUniqueOrThrow({
      where: { id: productImageId },
      select: { imageId: true },
    });

    await prisma.productImage.delete({ where: { id: productImageId } });

    destroyAsset(image.imageId).catch(err =>
      console.error("[Cloudinary] cleanup failed after image delete:", err),
    );

    revalidatePath(`/admin/products/${productId}/edit`);
    return toActionState("SUCCESS", "Image removed");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
