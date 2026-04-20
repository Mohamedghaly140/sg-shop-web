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
import { destroyAsset } from "@/lib/cloudinary";
import { makeSlug, allocateUniqueSlug } from "@/lib/slug";
import { parseOptionalString } from "@/features/admin/shared/utils";

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

const updateCategorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

const deleteCategorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
});

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const parsed = createCategorySchema.parse({ name: formData.get("name") });
    const imageId = parseOptionalString(formData.get("imageId"));
    const imageUrl = parseOptionalString(formData.get("imageUrl"));

    const slug = await allocateUniqueSlug(
      makeSlug(parsed.name, "category"),
      (s) => prisma.category.findFirst({ where: { slug: s } }).then(Boolean),
    );

    await prisma.category.create({
      data: { name: parsed.name.trim(), slug, imageId, imageUrl },
    });

    revalidatePath("/admin/categories");
    return toActionState("SUCCESS", "Category created successfully");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta as { target?: string[] })?.target;
      const field = target?.includes("name") ? "name" : "slug";
      return fromErrorToActionState(
        new Error(
          field === "name"
            ? `A category named "${formData.get("name")}" already exists`
            : "This slug is already taken"
        ),
        formData
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

export async function updateCategoryAction(
  _prevState: ActionState,
  formData: FormData
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
      (s) => prisma.category.findFirst({ where: { slug: s, NOT: { id: parsed.categoryId } } }).then(Boolean),
    );

    await prisma.category.update({
      where: { id: parsed.categoryId },
      data: { name: parsed.name.trim(), slug, imageId, imageUrl },
    });

    if (old.imageId && old.imageId !== imageId) {
      destroyAsset(old.imageId).catch((err) =>
        console.error("[Cloudinary] cleanup failed after category update:", err)
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
        formData
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

export async function deleteCategoryAction(
  _prevState: ActionState,
  formData: FormData
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
      console.error("[Cloudinary] cleanup failed after category delete:", err)
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
        formData
      );
    }
    return fromErrorToActionState(error, formData);
  }
}
