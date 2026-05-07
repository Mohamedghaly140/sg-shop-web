import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import type { FilterOptions } from "../types";

export async function getFilterOptions(): Promise<FilterOptions> {
  const [categories, sizesResult, colorsResult] = await Promise.all([
    prisma.category.findMany({
      where: { products: { some: { status: ProductStatus.ACTIVE } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.$queryRaw<{ size: string }[]>`
      SELECT DISTINCT UNNEST(sizes) AS size
      FROM "products"
      WHERE status = 'ACTIVE'
      ORDER BY size ASC
    `,
    prisma.$queryRaw<{ color: string }[]>`
      SELECT DISTINCT UNNEST(colors) AS color
      FROM "products"
      WHERE status = 'ACTIVE'
      ORDER BY color ASC
    `,
  ]);

  return {
    categories,
    sizes: sizesResult.map((r) => r.size),
    colors: colorsResult.map((r) => r.color),
  };
}
