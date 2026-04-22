"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { destroyAsset } from "@/lib/cloudinary";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";
import { makeSlug, allocateUniqueSlug } from "@/lib/slug";
import { parseOptionalString } from "@/features/admin/shared/utils";

const updateBrandSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

export async function updateBrandAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

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

    const slug = await allocateUniqueSlug(
      makeSlug(parsed.name, "brand"),
      (s) =>
        prisma.brand
          .findFirst({
            where: { slug: s, NOT: { id: parsed.brandId } },
          })
          .then(Boolean),
    );

    await prisma.brand.update({
      where: { id: parsed.brandId },
      data: { name: parsed.name.trim(), slug, imageId, imageUrl },
    });

    if (old.imageId && old.imageId !== imageId) {
      destroyAsset(old.imageId).catch((err) =>
        console.error("[Cloudinary] cleanup failed after brand update:", err),
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
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

