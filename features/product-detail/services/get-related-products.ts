import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import {
  storefrontProductSelect,
  type StorefrontProductItem,
} from "@/features/products/types";

const LIMIT = 6;

export const getRelatedProducts = cache(
  async (productId: string): Promise<StorefrontProductItem[]> => {
    const current = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        subCategories: { select: { subCategoryId: true } },
      },
    });

    if (!current) return [];

    const subCategoryIds = current.subCategories.map((s) => s.subCategoryId);

    const bySubcategory =
      subCategoryIds.length > 0
        ? await prisma.product.findMany({
            where: {
              status: ProductStatus.ACTIVE,
              id: { not: productId },
              subCategories: {
                some: { subCategoryId: { in: subCategoryIds } },
              },
            },
            select: storefrontProductSelect,
            take: LIMIT,
            orderBy: { createdAt: "desc" },
          })
        : [];

    const remaining = LIMIT - bySubcategory.length;

    const byCategory =
      remaining > 0
        ? await prisma.product.findMany({
            where: {
              status: ProductStatus.ACTIVE,
              categoryId: current.categoryId,
              id: { notIn: [productId, ...bySubcategory.map((p) => p.id)] },
            },
            select: storefrontProductSelect,
            take: remaining,
            orderBy: { createdAt: "desc" },
          })
        : [];

    return [...bySubcategory, ...byCategory].map((r) => ({
      ...r,
      price: r.price.toString(),
      discount: r.discount.toString(),
      priceAfterDiscount: r.priceAfterDiscount.toString(),
      ratingsAverage: r.ratingsAverage?.toString() ?? null,
    }));
  }
);
