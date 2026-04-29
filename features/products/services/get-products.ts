import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import { storefrontProductSelect, type StorefrontProductItem } from "../types";

const PAGE_SIZE = 24;

export type GetProductsParams = {
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  size: string;
  color: string;
  sort: string;
  page: number;
  featured: boolean;
};

export type GetProductsResult = {
  products: StorefrontProductItem[];
  total: number;
  pageCount: number;
};

function getOrderBy(sort: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { priceAfterDiscount: "asc" };
    case "price_desc":
      return { priceAfterDiscount: "desc" };
    case "best_rated":
      return { ratingsAverage: { sort: "desc", nulls: "last" } };
    case "most_sold":
      return { sold: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function getProducts({
  category,
  brand,
  minPrice,
  maxPrice,
  size,
  color,
  sort,
  page,
  featured,
}: GetProductsParams): Promise<GetProductsResult> {
  const safePage = Math.max(1, page);

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
  };

  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
  if (minPrice > 0 || maxPrice > 0) {
    where.priceAfterDiscount = {
      ...(minPrice > 0 ? { gte: minPrice } : {}),
      ...(maxPrice > 0 ? { lte: maxPrice } : {}),
    };
  }
  if (size) where.sizes = { has: size };
  if (color) where.colors = { has: color };
  if (featured) where.featured = true;

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: storefrontProductSelect,
      orderBy: getOrderBy(sort),
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const products: StorefrontProductItem[] = rows.map((r) => ({
    ...r,
    price: r.price.toString(),
    discount: r.discount.toString(),
    priceAfterDiscount: r.priceAfterDiscount.toString(),
    ratingsAverage: r.ratingsAverage?.toString() ?? null,
  }));

  return { products, total, pageCount };
}
