"use server";

import { ProductStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";
import { makeSlug, allocateUniqueSlug } from "@/lib/slug";
import { productIdFormSchema, revalidateProductCaches } from "./productActionHelpers";

export async function duplicateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const productId = productIdFormSchema.parse(formData.get("productId"));

    const src = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: {
        name: true,
        description: true,
        price: true,
        discount: true,
        priceAfterDiscount: true,
        quantity: true,
        sizes: true,
        colors: true,
        categoryId: true,
        brandId: true,
        subCategories: { select: { subCategoryId: true } },
      },
    });

    const baseSlug = makeSlug(`${src.name}-copy`, "product");

    const created = await prisma.$transaction(async (tx) => {
      const slug = await allocateUniqueSlug(
        baseSlug,
        (s) => tx.product.findFirst({ where: { slug: s }, select: { id: true } }).then(Boolean),
      );
      return tx.product.create({
        data: {
          name: `${src.name} (copy)`,
          slug,
          description: src.description,
          price: src.price,
          discount: src.discount,
          priceAfterDiscount: src.priceAfterDiscount,
          quantity: src.quantity,
          sizes: src.sizes,
          colors: src.colors,
          imageId: "",
          imageUrl: "",
          status: ProductStatus.DRAFT,
          featured: false,
          categoryId: src.categoryId,
          brandId: src.brandId,
          subCategories: {
            create: src.subCategories.map((s) => ({ subCategoryId: s.subCategoryId })),
          },
        },
        select: { id: true },
      });
    });

    revalidateProductCaches();
    return toActionState("SUCCESS", "Product duplicated", undefined, {
      id: created.id,
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
