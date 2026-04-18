import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export type ProductForForm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount: string;
  priceAfterDiscount: string;
  quantity: number;
  sizes: string[];
  colors: string[];
  imageId: string;
  imageUrl: string;
  status: string;
  featured: boolean;
  categoryId: string;
  brandId: string | null;
  images: Array<{
    id: string;
    imageId: string;
    imageUrl: string;
    sortOrder: number;
  }>;
  subCategoryIds: string[];
};

export async function getProductById(id: string): Promise<ProductForForm> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      subCategories: { select: { subCategoryId: true } },
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
    sizes: product.sizes,
    colors: product.colors,
    imageId: product.imageId,
    imageUrl: product.imageUrl,
    status: product.status,
    featured: product.featured,
    categoryId: product.categoryId,
    brandId: product.brandId,
    images: product.images
      .filter((i): i is typeof i & { imageId: string; imageUrl: string } =>
        Boolean(i.imageId && i.imageUrl),
      )
      .map((i) => ({
        id: i.id,
        imageId: i.imageId,
        imageUrl: i.imageUrl,
        sortOrder: i.sortOrder,
      })),
    subCategoryIds: product.subCategories.map((s) => s.subCategoryId),
  };
}
