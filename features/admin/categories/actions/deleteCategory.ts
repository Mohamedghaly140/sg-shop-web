"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { destroyAsset } from "@/lib/cloudinary";
import { requireManagerOrAdmin } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";

const deleteCategorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
});

export async function deleteCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const { categoryId } = deleteCategorySchema.parse({
      categoryId: formData.get("categoryId"),
    });

    const category = await prisma.category.findUniqueOrThrow({
      where: { id: categoryId },
      select: { imageId: true },
    });

    await prisma.category.delete({ where: { id: categoryId } });

    destroyAsset(category.imageId).catch((err) =>
      console.error("[Cloudinary] cleanup failed after category delete:", err),
    );

    revalidatePath("/admin/categories");
    return toActionState("SUCCESS", "Category deleted successfully");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return fromErrorToActionState(
        new Error("Remove all subcategories before deleting this category"),
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

