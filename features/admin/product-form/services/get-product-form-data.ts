import { prisma } from "@/lib/prisma";

export type ProductFormData = {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  subCategories: { id: string; name: string; categoryId: string }[];
};

export async function getProductFormData(): Promise<ProductFormData> {
  const [categories, brands, subCategories] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.subCategory.findMany({
      select: { id: true, name: true, categoryId: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { categories, brands, subCategories };
}
