import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, status: ProductStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
      discount: true,
      priceAfterDiscount: true,
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

export async function getHomeCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
    },
    orderBy: { name: "asc" },
  });
}
