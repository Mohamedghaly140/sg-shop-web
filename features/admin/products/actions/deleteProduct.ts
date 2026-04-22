"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { destroyAssets } from "@/lib/cloudinary";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";
import { productIdFormSchema, revalidateProductCaches } from "./productActionHelpers";

export async function deleteProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const productId = productIdFormSchema.parse(formData.get("productId"));

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: {
        id: true,
        imageId: true,
        images: { select: { imageId: true } },
      },
    });

    await prisma.product.delete({ where: { id: productId } });

    destroyAssets([
      product.imageId,
      ...product.images.map((i) => i.imageId),
    ]).catch(err => console.error("[Cloudinary] cleanup failed after product delete:", err));

    revalidateProductCaches();
    return toActionState("SUCCESS", "Product deleted successfully");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return fromErrorToActionState(
        new Error("Cannot delete: this product is referenced by orders or carts"),
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}
