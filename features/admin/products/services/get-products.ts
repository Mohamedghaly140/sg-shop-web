import type { Prisma, ProductStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: string;
  priceAfterDiscount: string;
  discount: string;
  quantity: number;
  sold: number;
  imageUrl: string;
  status: ProductStatus;
  featured: boolean;
  createdAt: Date;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
};

type GetProductsParams = {
  page: number;
  limit: number;
  search: string;
  status: ProductStatus | null;
  categoryId: string | null;
  brandId: string | null;
  featured: boolean | null;
};

type GetProductsResult = {
  products: ProductListItem[];
  total: number;
  pageCount: number;
};

export async function getProducts({
  page,
  limit,
  search,
  status,
  categoryId,
  brandId,
  featured,
}: GetProductsParams): Promise<GetProductsResult> {
  const where: Prisma.ProductWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(featured !== null ? { featured } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        priceAfterDiscount: true,
        discount: true,
        quantity: true,
        sold: true,
        imageUrl: true,
        status: true,
        featured: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const products: ProductListItem[] = rows.map((r) => ({
    ...r,
    price: r.price.toString(),
    priceAfterDiscount: r.priceAfterDiscount.toString(),
    discount: r.discount.toString(),
  }));

  return {
    products,
    total,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}
