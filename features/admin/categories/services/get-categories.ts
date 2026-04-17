import type { Category, SubCategory } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type GetCategoriesParams = {
  page: number;
  limit: number;
  search: string;
};

export type CategoryRow = Pick<Category, "id" | "name" | "slug" | "imageUrl" | "createdAt"> & {
  subCategories: Pick<SubCategory, "id" | "name" | "slug">[];
};

type GetCategoriesResult = {
  categories: CategoryRow[];
  total: number;
  pageCount: number;
};

export async function getCategories({
  page,
  limit,
  search,
}: GetCategoriesParams): Promise<GetCategoriesResult> {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        createdAt: true,
        subCategories: {
          select: { id: true, name: true, slug: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.category.count({ where }),
  ]);

  return {
    categories,
    total,
    pageCount: Math.ceil(total / limit),
  };
}
