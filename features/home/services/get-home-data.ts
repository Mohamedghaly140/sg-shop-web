import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import { storefrontProductSelect } from "@/features/products/types";
import type { StorefrontProductItem } from "@/features/products/types";

export async function getFeaturedProducts(): Promise<StorefrontProductItem[]> {
  const products = await prisma.product.findMany({
    where: { featured: true, status: ProductStatus.ACTIVE },
    select: storefrontProductSelect,
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    ...p,
    price: p.price.toString(),
    discount: p.discount.toString(),
    priceAfterDiscount: p.priceAfterDiscount.toString(),
    ratingsAverage: p.ratingsAverage?.toString() ?? null,
  }));
}

export async function getHomeCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
    },
    orderBy: { name: "asc" },
  });
}
