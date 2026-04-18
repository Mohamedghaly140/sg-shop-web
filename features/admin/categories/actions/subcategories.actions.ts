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

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugifyText(input: string): string {
  const s = input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "subcategory";
}

async function allocateUniqueSlug(base: string, excludeSubcategoryId?: string): Promise<string> {
  let candidate = base;
  let n = 2;
  for (;;) {
    const existing = await prisma.subCategory.findFirst({
      where: {
        slug: candidate,
        ...(excludeSubcategoryId ? { NOT: { id: excludeSubcategoryId } } : {}),
      },
    });
    if (!existing) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 10_000) throw new Error("Could not generate a unique slug");
  }
}

const createSubcategorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slugRaw: z.string().trim(),
});

const updateSubcategorySchema = z.object({
  subcategoryId: z.string().min(1, "Subcategory is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slugRaw: z.string().trim(),
});

const deleteSubcategorySchema = z.object({
  subcategoryId: z.string().min(1, "Subcategory is required"),
});

function resolveSlugInput(name: string, slugRaw: string): string {
  const trimmed = slugRaw.trim();
  if (!trimmed) return slugifyText(name);
  const slugified = slugifyText(trimmed);
  if (!slugPattern.test(slugified)) {
    throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
  }
  return slugified;
}

export async function createSubcategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const parsed = createSubcategorySchema.parse({
      categoryId: formData.get("categoryId"),
      name: formData.get("name"),
      slugRaw: formData.get("slug") ?? "",
    });

    const baseSlug = resolveSlugInput(parsed.name, parsed.slugRaw);
    const slug = await allocateUniqueSlug(baseSlug);

    await prisma.subCategory.create({
      data: { name: parsed.name.trim(), slug, categoryId: parsed.categoryId },
    });

    revalidatePath("/admin/categories");
    return toActionState("SUCCESS", "Subcategory created successfully");
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
            ? `A subcategory named "${formData.get("name")}" already exists`
            : "This slug is already taken"
        ),
        formData
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

export async function updateSubcategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const parsed = updateSubcategorySchema.parse({
      subcategoryId: formData.get("subcategoryId"),
      name: formData.get("name"),
      slugRaw: formData.get("slug") ?? "",
    });

    const baseSlug = resolveSlugInput(parsed.name, parsed.slugRaw);
    const slug = await allocateUniqueSlug(baseSlug, parsed.subcategoryId);

    await prisma.subCategory.update({
      where: { id: parsed.subcategoryId },
      data: { name: parsed.name.trim(), slug },
    });

    revalidatePath("/admin/categories");
    return toActionState("SUCCESS", "Subcategory updated successfully");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fromErrorToActionState(
        new Error("A subcategory with this name or slug already exists"),
        formData
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

export async function deleteSubcategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const { subcategoryId } = deleteSubcategorySchema.parse({
      subcategoryId: formData.get("subcategoryId"),
    });

    await prisma.subCategory.delete({ where: { id: subcategoryId } });

    revalidatePath("/admin/categories");
    return toActionState("SUCCESS", "Subcategory deleted successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
