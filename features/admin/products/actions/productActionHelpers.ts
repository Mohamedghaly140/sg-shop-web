import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma, ProductStatus } from "@/generated/prisma/client";
import {
  productFormSchema,
  productImageInputSchema,
} from "@/features/admin/product-form/schemas/product-schema";

export const productIdFormSchema = z.string().min(1, "Product id is required");

export function revalidateProductCaches() {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/search");
  revalidatePath("/categories/[slug]", "page");
}

function parseImagesFromFormData(formData: FormData) {
  const indexed = new Map<number, { imageId?: string; imageUrl?: string; sortOrder?: number }>();
  for (const [key, value] of formData.entries()) {
    const match = /^images\[(\d+)]\[(imageId|imageUrl|sortOrder)]$/.exec(key);
    if (!match) continue;
    const i = Number(match[1]);
    const field = match[2] as "imageId" | "imageUrl" | "sortOrder";
    const row = indexed.get(i) ?? {};
    if (field === "sortOrder") row.sortOrder = Number(value);
    else row[field] = String(value);
    indexed.set(i, row);
  }
  const rows = [...indexed.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, v]) => v)
    .filter((r): r is { imageId: string; imageUrl: string; sortOrder: number } =>
      Boolean(r.imageId && r.imageUrl),
    );
  return rows.map((r, i) =>
    productImageInputSchema.parse({
      imageId: r.imageId,
      imageUrl: r.imageUrl,
      sortOrder: Number.isFinite(r.sortOrder) ? r.sortOrder : i,
    }),
  );
}

export function parseProductFormData(formData: FormData) {
  return productFormSchema.parse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    price: formData.get("price") ?? "",
    discount: formData.get("discount") ?? "",
    quantity: formData.get("quantity") ?? "",
    sizes: formData.getAll("sizes").map(String).filter(Boolean),
    colors: formData.getAll("colors").map(String).filter(Boolean),
    imageId: formData.get("imageId") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    images: parseImagesFromFormData(formData),
    status: formData.get("status") ?? ProductStatus.DRAFT,
    featured: formData.get("featured") === "on",
    categoryId: formData.get("categoryId") ?? "",
    brandId: formData.get("brandId") ?? "",
    subCategoryIds: formData.getAll("subCategoryIds").map(String).filter(Boolean),
  });
}

export function computePriceAfterDiscount(price: string, discount: string): Prisma.Decimal {
  const p = new Prisma.Decimal(price);
  const d = new Prisma.Decimal(discount || "0");
  return p.minus(p.times(d).dividedBy(100)).toDecimalPlaces(2);
}
