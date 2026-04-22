"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { destroyAsset } from "@/lib/cloudinary";
import { requireManagerOrAdmin } from "@/lib/require-role";
import { makeSlug, allocateUniqueSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { parseOptionalString } from "@/features/admin/shared/utils";

const updateCategorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

export async function updateCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const parsed = updateCategorySchema.parse({
      categoryId: formData.get("categoryId"),
      name: formData.get("name"),
    });

    const imageId = parseOptionalString(formData.get("imageId"));
    const imageUrl = parseOptionalString(formData.get("imageUrl"));

    const old = await prisma.category.findUniqueOrThrow({
      where: { id: parsed.categoryId },
      select: { imageId: true },
    });

    const slug = await allocateUniqueSlug(
      makeSlug(parsed.name, "category"),
      (s) =>
        prisma.category
          .findFirst({
            where: { slug: s, NOT: { id: parsed.categoryId } },
          })
          .then(Boolean),
    );

    await prisma.category.update({
      where: { id: parsed.categoryId },
      data: { name: parsed.name.trim(), slug, imageId, imageUrl },
    });

    if (old.imageId && old.imageId !== imageId) {
      destroyAsset(old.imageId).catch((err) =>
        console.error("[Cloudinary] cleanup failed after category update:", err),
      );
    }

    revalidatePath("/admin/categories");
    return toActionState("SUCCESS", "Category updated successfully");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fromErrorToActionState(
        new Error("A category with this name or slug already exists"),
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

