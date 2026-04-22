"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";
import { makeSlug, allocateUniqueSlug } from "@/lib/slug";
import {
  computePriceAfterDiscount,
  parseProductFormData,
  revalidateProductCaches,
} from "./productActionHelpers";

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const data = parseProductFormData(formData);

    const price = new Prisma.Decimal(data.price);
    const discount = new Prisma.Decimal(data.discount || "0");
    const priceAfterDiscount = computePriceAfterDiscount(data.price, data.discount || "0");

    const created = await prisma.$transaction(async (tx) => {
      const slug = await allocateUniqueSlug(
        makeSlug(data.name, "product"),
        (s) => tx.product.findFirst({ where: { slug: s }, select: { id: true } }).then(Boolean),
      );
      return tx.product.create({
        data: {
          name: data.name.trim(),
          slug,
          description: data.description,
          price,
          discount,
          priceAfterDiscount,
          quantity: Number(data.quantity),
          sizes: data.sizes,
          colors: data.colors,
          imageId: data.imageId,
          imageUrl: data.imageUrl,
          status: data.status,
          featured: data.featured,
          categoryId: data.categoryId,
          brandId: data.brandId,
          images: {
            create: data.images.map((img, i) => ({
              imageId: img.imageId,
              imageUrl: img.imageUrl,
              sortOrder: img.sortOrder ?? i,
            })),
          },
          subCategories: {
            create: data.subCategoryIds.map((id) => ({ subCategoryId: id })),
          },
        },
        select: { id: true },
      });
    });

    revalidateProductCaches();
    return toActionState("SUCCESS", "Product created successfully", undefined, {
      id: created.id,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fromErrorToActionState(
        new Error("A product with this slug already exists"),
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}
