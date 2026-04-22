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

const deleteBrandSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
});

export async function deleteBrandAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const { brandId } = deleteBrandSchema.parse({
      brandId: formData.get("brandId"),
    });

    const brand = await prisma.brand.findUniqueOrThrow({
      where: { id: brandId },
      select: { imageId: true },
    });

    await prisma.brand.delete({ where: { id: brandId } });

    destroyAsset(brand.imageId).catch((err) =>
      console.error("[Cloudinary] cleanup failed after brand delete:", err),
    );

    revalidatePath("/admin/brands");
    return toActionState("SUCCESS", "Brand deleted successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

