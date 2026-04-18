import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount: string;
  priceAfterDiscount: string;
  quantity: number;
  sold: number;
  sizes: string[];
  colors: string[];
  imageUrl: string;
  status: ProductStatus;
  featured: boolean;
  ratingsAverage: string | null;
  ratingsQuantity: number;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string } | null;
  subCategories: { id: string; name: string }[];
  images: { id: string; imageUrl: string }[];
};

export async function getProductDetail(id: string): Promise<ProductDetail> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
      subCategories: {
        include: { subCategory: { select: { id: true, name: true } } },
      },
    },
  });
  if (!product) notFound();

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    discount: product.discount.toString(),
    priceAfterDiscount: product.priceAfterDiscount.toString(),
    quantity: product.quantity,
    sold: product.sold,
    sizes: product.sizes,
    colors: product.colors,
    imageUrl: product.imageUrl,
    status: product.status,
    featured: product.featured,
    ratingsAverage: product.ratingsAverage?.toString() ?? null,
    ratingsQuantity: product.ratingsQuantity,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: product.category,
    brand: product.brand,
    subCategories: product.subCategories.map((s) => ({
      id: s.subCategory.id,
      name: s.subCategory.name,
    })),
    images: product.images
      .filter((i): i is typeof i & { imageUrl: string } => Boolean(i.imageUrl))
      .map((i) => ({ id: i.id, imageUrl: i.imageUrl })),
  };
}
