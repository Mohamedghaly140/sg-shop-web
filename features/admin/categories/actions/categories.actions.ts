"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import slugify from "slugify";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";

function makeSlug(name: string): string {
  return slugify(name, { lower: true, strict: true }) || "category";
}

async function allocateUniqueSlug(base: string, excludeCategoryId?: string): Promise<string> {
  let candidate = base;
  let n = 2;
  for (;;) {
    const existing = await prisma.category.findFirst({
      where: {
        slug: candidate,
        ...(excludeCategoryId ? { NOT: { id: excludeCategoryId } } : {}),
      },
    });
    if (!existing) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 10_000) throw new Error("Could not generate a unique slug");
  }
}

const optionalImageUrlSchema = z
  .string()
  .trim()
  .transform((s) => (s === "" ? null : s))
  .pipe(z.union([z.null(), z.url("Invalid image URL")]));

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  imageUrl: z.string().trim(),
});

const updateCategorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  imageUrl: z.string().trim(),
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

    const parsed = createCategorySchema.parse({
      name: formData.get("name"),
      imageUrl: formData.get("imageUrl") ?? "",
    });

    const imageUrl = optionalImageUrlSchema.parse(parsed.imageUrl);
    const slug = await allocateUniqueSlug(makeSlug(parsed.name));

    await prisma.category.create({
      data: { name: parsed.name.trim(), slug, imageUrl, imageId: null },
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
      imageUrl: formData.get("imageUrl") ?? "",
    });

    const imageUrl = optionalImageUrlSchema.parse(parsed.imageUrl);
    const slug = await allocateUniqueSlug(makeSlug(parsed.name), parsed.categoryId);

    await prisma.category.update({
      where: { id: parsed.categoryId },
      data: { name: parsed.name.trim(), slug, imageUrl },
    });

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

    // When Cloudinary is integrated, call cloudinary.uploader.destroy(imageId) if imageId is set.
    await prisma.category.delete({ where: { id: categoryId } });

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
