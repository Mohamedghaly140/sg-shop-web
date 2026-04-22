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
import { makeSlug, allocateUniqueSlug } from "@/lib/slug";
import { parseOptionalString } from "@/features/admin/shared/utils";

const createBrandSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

export async function createBrandAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();

    const parsed = createBrandSchema.parse({ name: formData.get("name") });
    const imageId = parseOptionalString(formData.get("imageId"));
    const imageUrl = parseOptionalString(formData.get("imageUrl"));

    const slug = await allocateUniqueSlug(
      makeSlug(parsed.name, "brand"),
      (s) => prisma.brand.findFirst({ where: { slug: s } }).then(Boolean),
    );

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
            : "This slug is already taken",
        ),
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

