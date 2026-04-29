import type { Prisma } from "@/generated/prisma/client";
import type { ProductStatus } from "@/generated/prisma/enums";

export const storefrontProductSelect = {
  id: true,
  name: true,
  slug: true,
  imageUrl: true,
  price: true,
  discount: true,
  priceAfterDiscount: true,
  ratingsAverage: true,
  ratingsQuantity: true,
  quantity: true,
  status: true,
  createdAt: true,
} as const;

type StorefrontProductRow = Prisma.ProductGetPayload<{
  select: typeof storefrontProductSelect;
}>;

export type StorefrontProductItem = Omit<
  StorefrontProductRow,
  "price" | "discount" | "priceAfterDiscount" | "ratingsAverage"
> & {
  price: string;
  discount: string;
  priceAfterDiscount: string;
  ratingsAverage: string | null;
  status: ProductStatus;
  createdAt: Date;
};

export type FilterOptions = {
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
  sizes: string[];
  colors: string[];
};
