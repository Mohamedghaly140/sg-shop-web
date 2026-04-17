import type { Brand } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type GetBrandsParams = {
  page: number;
  limit: number;
  search: string;
};

type GetBrandsResult = {
  brands: Pick<Brand, "id" | "name" | "slug" | "imageUrl" | "createdAt">[];
  total: number;
  pageCount: number;
};

export async function getBrands({
  page,
  limit,
  search,
}: GetBrandsParams): Promise<GetBrandsResult> {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.brand.count({ where }),
  ]);

  return {
    brands,
    total,
    pageCount: Math.ceil(total / limit),
  };
}
