import { z } from "zod";

import { ProductStatus } from "@/generated/prisma/enums";

const nonEmpty = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const optionalString = z
  .string()
  .trim()
  .transform((s) => (s === "" ? null : s));

const decimalString = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), `${label} must be a positive number with up to 2 decimals`);

const optionalDecimalString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? "0" : v))
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Must be a number with up to 2 decimals");

const intString = (label: string, { min = 0 }: { min?: number } = {}) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => /^\d+$/.test(v) && Number(v) >= min, `${label} must be an integer ≥ ${min}`);

export const productImageInputSchema = z.object({
  imageId: nonEmpty("Image ID"),
  imageUrl: z.url("Image URL is invalid"),
  sortOrder: z.number().int().nonnegative().default(0),
});

export type ProductImageInput = z.infer<typeof productImageInputSchema>;

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  price: decimalString("Price"),
  discount: optionalDecimalString,
  quantity: intString("Quantity", { min: 0 }),
  sizes: z.array(z.string().trim().min(1)).default([]),
  colors: z.array(z.string().trim().min(1)).default([]),
  imageId: nonEmpty("Main image"),
  imageUrl: z.url("Main image URL is invalid"),
  images: z.array(productImageInputSchema).default([]),
  status: z.enum(ProductStatus).default(ProductStatus.DRAFT),
  featured: z.boolean().default(false),
  categoryId: nonEmpty("Category"),
  brandId: optionalString.nullable(),
  subCategoryIds: z.array(z.string().trim().min(1)).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
