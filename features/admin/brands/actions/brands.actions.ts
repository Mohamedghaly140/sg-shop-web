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
import { requireAdmin } from "@/lib/require-role";
import { destroyAsset } from "@/lib/cloudinary";

function makeSlug(name: string): string {
  return slugify(name, { lower: true, strict: true }) || "brand";
}

async function allocateUniqueSlug(base: string, excludeBrandId?: string): Promise<string> {
  let candidate = base;
  let n = 2;
  for (;;) {
    const existing = await prisma.brand.findFirst({
      where: {
        slug: candidate,
        ...(excludeBrandId ? { NOT: { id: excludeBrandId } } : {}),
      },
    });
    if (!existing) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 10_000) {
      throw new Error("Could not generate a unique slug");
    }
  }
}

function parseOptionalString(val: FormDataEntryValue | null): string | null {
  const s = typeof val === "string" ? val.trim() : "";
  return s || null;
}

const createBrandSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

const updateBrandSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

const deleteBrandSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
});

export async function createBrandAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = createBrandSchema.parse({ name: formData.get("name") });
    const imageId = parseOptionalString(formData.get("imageId"));
    const imageUrl = parseOptionalString(formData.get("imageUrl"));

    const slug = await allocateUniqueSlug(makeSlug(parsed.name));

    await prisma.brand.create({
      data: { name: parsed.name.trim(), slug, imageId, imageUrl },
    });

    revalidatePath("/admin/brands");
    return toActionState("SUCCESS", "Brand created successfully");
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
            ? `A brand named "${formData.get("name")}" already exists`
            : "This slug is already taken"
        ),
        formData
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

export async function updateBrandAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = updateBrandSchema.parse({
      brandId: formData.get("brandId"),
      name: formData.get("name"),
    });

    const imageId = parseOptionalString(formData.get("imageId"));
    const imageUrl = parseOptionalString(formData.get("imageUrl"));

    const old = await prisma.brand.findUniqueOrThrow({
      where: { id: parsed.brandId },
      select: { imageId: true },
    });

    const slug = await allocateUniqueSlug(makeSlug(parsed.name), parsed.brandId);

    await prisma.brand.update({
      where: { id: parsed.brandId },
      data: { name: parsed.name.trim(), slug, imageId, imageUrl },
    });

    if (old.imageId && old.imageId !== imageId) {
      destroyAsset(old.imageId).catch((err) =>
        console.error("[Cloudinary] cleanup failed after brand update:", err)
      );
    }

    revalidatePath("/admin/brands");
    return toActionState("SUCCESS", "Brand updated successfully");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fromErrorToActionState(
        new Error("A brand with this name or slug already exists"),
        formData
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

export async function deleteBrandAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const { brandId } = deleteBrandSchema.parse({
      brandId: formData.get("brandId"),
    });

    const brand = await prisma.brand.findUniqueOrThrow({
      where: { id: brandId },
      select: { imageId: true },
    });

    await prisma.brand.delete({ where: { id: brandId } });

    destroyAsset(brand.imageId).catch((err) =>
      console.error("[Cloudinary] cleanup failed after brand delete:", err)
    );

    revalidatePath("/admin/brands");
    return toActionState("SUCCESS", "Brand deleted successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
