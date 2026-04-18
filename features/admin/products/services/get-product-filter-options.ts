import { prisma } from "@/lib/prisma";

export type ProductFilterOptions = {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
};

export async function getProductFilterOptions(): Promise<ProductFilterOptions> {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { categories, brands };
}
