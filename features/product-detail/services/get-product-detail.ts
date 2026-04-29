import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

export const getProductDetail = cache(async (slug: string) => {
  const { userId } = await auth();

  const product = await prisma.product.findUnique({
    where: { slug, status: ProductStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      quantity: true,
      price: true,
      discount: true,
      priceAfterDiscount: true,
      sizes: true,
      colors: true,
      imageUrl: true,
      ratingsAverage: true,
      ratingsQuantity: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
      images: {
        select: { imageUrl: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      },
      wishlistedBy: {
        where: { userId: userId ?? "" },
        select: { userId: true },
      },
    },
  });

  if (!product) return null;

  const { wishlistedBy, ...rest } = product;
  return {
    ...rest,
    inWishlist: wishlistedBy.length > 0,
  };
});

export type ProductDetailData = NonNullable<
  Awaited<ReturnType<typeof getProductDetail>>
>;
