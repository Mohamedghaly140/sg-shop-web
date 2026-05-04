import { prisma } from "@/lib/prisma";

export type ProductFilterOptions = {
  categories: { id: string; name: string }[];
};

export async function getProductFilterOptions(): Promise<ProductFilterOptions> {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return { categories };
}
