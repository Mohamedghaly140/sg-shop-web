import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import type { FilterOptions } from "../types";

export async function getFilterOptions(): Promise<FilterOptions> {
  const [categories, brands, activeProducts] = await Promise.all([
    prisma.category.findMany({
      where: { products: { some: { status: ProductStatus.ACTIVE } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      where: { products: { some: { status: ProductStatus.ACTIVE } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE },
      select: { sizes: true, colors: true },
    }),
  ]);

  const sizes = [...new Set(activeProducts.flatMap((p) => p.sizes))].sort();
  const colors = [...new Set(activeProducts.flatMap((p) => p.colors))].sort();

  return { categories, brands, sizes, colors };
}
