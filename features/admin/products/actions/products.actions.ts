"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma, ProductStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { destroyAsset, destroyAssets } from "@/lib/cloudinary";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import {
  productFormSchema,
  productImageInputSchema,
} from "@/features/admin/product-form/schemas/product-schema";
import { requireManagerOrAdmin } from "@/lib/require-role";
import { makeSlug, allocateUniqueSlug } from "@/lib/slug";

// ─── Cache invalidation ───────────────────────────────────────────────────────

function revalidateProductCaches() {
  // Admin
  revalidatePath("/admin/products");
  // Storefront — products surface on all these routes
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/search");
  revalidatePath("/categories/[slug]", "page");
}

// ─── Form parsing ─────────────────────────────────────────────────────────────

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

function parseProductFormData(formData: FormData) {
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

function computePriceAfterDiscount(price: string, discount: string): Prisma.Decimal {
  const p = new Prisma.Decimal(price);
  const d = new Prisma.Decimal(discount || "0");
  return p.minus(p.times(d).dividedBy(100)).toDecimalPlaces(2);
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const data = parseProductFormData(formData);

    const price = new Prisma.Decimal(data.price);
    const discount = new Prisma.Decimal(data.discount || "0");
    const priceAfterDiscount = computePriceAfterDiscount(data.price, data.discount || "0");

    // Slug allocation runs inside the transaction — check and INSERT are atomic.
    const created = await prisma.$transaction(async (tx) => {
      const slug = await allocateUniqueSlug(
        makeSlug(data.name, "product"),
        (s) => tx.product.findFirst({ where: { slug: s }, select: { id: true } }).then(Boolean),
      );
      return tx.product.create({
        data: {
          name: data.name.trim(),
          slug,
          description: data.description,
          price,
          discount,
          priceAfterDiscount,
          quantity: Number(data.quantity),
          sizes: data.sizes,
          colors: data.colors,
          imageId: data.imageId,
          imageUrl: data.imageUrl,
          status: data.status,
          featured: data.featured,
          categoryId: data.categoryId,
          brandId: data.brandId,
          images: {
            create: data.images.map((img, i) => ({
              imageId: img.imageId,
              imageUrl: img.imageUrl,
              sortOrder: img.sortOrder ?? i,
            })),
          },
          subCategories: {
            create: data.subCategoryIds.map((id) => ({ subCategoryId: id })),
          },
        },
        select: { id: true },
      });
    });

    revalidateProductCaches();
    return toActionState("SUCCESS", "Product created successfully", undefined, {
      id: created.id,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fromErrorToActionState(
        new Error("A product with this slug already exists"),
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

const updateIdSchema = z.string().min(1, "Product id is required");

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const productId = updateIdSchema.parse(formData.get("productId"));
    const data = parseProductFormData(formData);

    const existing = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: {
        id: true,
        imageId: true,
        images: { select: { id: true, imageId: true } },
      },
    });

    const price = new Prisma.Decimal(data.price);
    const discount = new Prisma.Decimal(data.discount || "0");
    const priceAfterDiscount = computePriceAfterDiscount(data.price, data.discount || "0");

    const keptGalleryIds = new Set(
      data.images.map((img) => img.imageId).filter(Boolean),
    );
    const removed = existing.images.filter(
      (img) => img.imageId && !keptGalleryIds.has(img.imageId),
    );

    const staleMainImageId =
      existing.imageId && existing.imageId !== data.imageId ? existing.imageId : null;

    const existingByImageId = new Map(existing.images.map((img) => [img.imageId, img]));

    // Slug allocation runs inside the transaction — check and UPDATE are atomic.
    await prisma.$transaction(async (tx) => {
      const slug = await allocateUniqueSlug(
        makeSlug(data.name, "product"),
        (s) => tx.product.findFirst({ where: { slug: s, NOT: { id: productId } }, select: { id: true } }).then(Boolean),
      );

      if (removed.length > 0) {
        await tx.productImage.deleteMany({
          where: { id: { in: removed.map((i) => i.id) } },
        });
      }

      for (const [i, img] of data.images.entries()) {
        const match = existingByImageId.get(img.imageId);
        if (match) {
          await tx.productImage.update({
            where: { id: match.id },
            data: { imageUrl: img.imageUrl, sortOrder: img.sortOrder ?? i },
          });
        } else {
          await tx.productImage.create({
            data: {
              productId,
              imageId: img.imageId,
              imageUrl: img.imageUrl,
              sortOrder: img.sortOrder ?? i,
            },
          });
        }
      }

      await tx.productSubCategory.deleteMany({ where: { productId } });
      if (data.subCategoryIds.length > 0) {
        await tx.productSubCategory.createMany({
          data: data.subCategoryIds.map((id) => ({
            productId,
            subCategoryId: id,
          })),
        });
      }

      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name.trim(),
          slug,
          description: data.description,
          price,
          discount,
          priceAfterDiscount,
          quantity: Number(data.quantity),
          sizes: data.sizes,
          colors: data.colors,
          imageId: data.imageId,
          imageUrl: data.imageUrl,
          status: data.status,
          featured: data.featured,
          categoryId: data.categoryId,
          brandId: data.brandId,
        },
      });
    });

    // Best-effort — DB commit is canonical; log failures but don't surface them.
    destroyAssets([
      staleMainImageId,
      ...removed.map((r) => r.imageId),
    ]).catch(err => console.error("[Cloudinary] cleanup failed after product update:", err));

    revalidateProductCaches();
    revalidatePath(`/admin/products/${productId}`);
    return toActionState("SUCCESS", "Product updated successfully", undefined, {
      id: productId,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fromErrorToActionState(
        new Error("A product with this slug already exists"),
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

export async function deleteProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const productId = updateIdSchema.parse(formData.get("productId"));

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: {
        id: true,
        imageId: true,
        images: { select: { imageId: true } },
      },
    });

    await prisma.product.delete({ where: { id: productId } });

    // Best-effort — DB delete is canonical; log failures but don't surface them.
    destroyAssets([
      product.imageId,
      ...product.images.map((i) => i.imageId),
    ]).catch(err => console.error("[Cloudinary] cleanup failed after product delete:", err));

    revalidateProductCaches();
    return toActionState("SUCCESS", "Product deleted successfully");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return fromErrorToActionState(
        new Error("Cannot delete: this product is referenced by orders or carts"),
        formData,
      );
    }
    return fromErrorToActionState(error, formData);
  }
}

const statusSchema = z.object({
  productId: z.string().min(1),
  status: z.enum(ProductStatus),
});

export async function updateProductStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const { productId, status } = statusSchema.parse({
      productId: formData.get("productId"),
      status: formData.get("status"),
    });

    await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    revalidateProductCaches();
    revalidatePath(`/admin/products/${productId}`);
    return toActionState("SUCCESS", `Product marked as ${status.toLowerCase()}`);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

const featuredSchema = z.object({
  productId: z.string().min(1),
  featured: z.enum(["true", "false"]),
});

export async function toggleFeaturedAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const { productId, featured } = featuredSchema.parse({
      productId: formData.get("productId"),
      featured: formData.get("featured"),
    });

    await prisma.product.update({
      where: { id: productId },
      data: { featured: featured === "true" },
    });

    revalidateProductCaches();
    revalidatePath(`/admin/products/${productId}`);
    return toActionState(
      "SUCCESS",
      featured === "true" ? "Product featured" : "Product unfeatured",
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

const deleteImageSchema = z.object({
  productId: z.string().min(1),
  productImageId: z.string().min(1),
});

export async function deleteProductImageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const { productId, productImageId } = deleteImageSchema.parse({
      productId: formData.get("productId"),
      productImageId: formData.get("productImageId"),
    });

    const image = await prisma.productImage.findUniqueOrThrow({
      where: { id: productImageId },
      select: { imageId: true },
    });

    await prisma.productImage.delete({ where: { id: productImageId } });

    // Best-effort — DB delete is canonical; log failures but don't surface them.
    destroyAsset(image.imageId).catch(err =>
      console.error("[Cloudinary] cleanup failed after image delete:", err),
    );

    revalidatePath(`/admin/products/${productId}/edit`);
    return toActionState("SUCCESS", "Image removed");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

export async function duplicateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const productId = updateIdSchema.parse(formData.get("productId"));

    const src = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: {
        name: true,
        description: true,
        price: true,
        discount: true,
        priceAfterDiscount: true,
        quantity: true,
        sizes: true,
        colors: true,
        categoryId: true,
        brandId: true,
        subCategories: { select: { subCategoryId: true } },
      },
    });

    const baseSlug = makeSlug(`${src.name}-copy`, "product");

    // Images are intentionally not copied — both products would share the same
    // Cloudinary public IDs, so deleting the original would break the duplicate.
    const created = await prisma.$transaction(async (tx) => {
      const slug = await allocateUniqueSlug(
        baseSlug,
        (s) => tx.product.findFirst({ where: { slug: s }, select: { id: true } }).then(Boolean),
      );
      return tx.product.create({
        data: {
          name: `${src.name} (copy)`,
          slug,
          description: src.description,
          price: src.price,
          discount: src.discount,
          priceAfterDiscount: src.priceAfterDiscount,
          quantity: src.quantity,
          sizes: src.sizes,
          colors: src.colors,
          imageId: "",
          imageUrl: "",
          status: ProductStatus.DRAFT,
          featured: false,
          categoryId: src.categoryId,
          brandId: src.brandId,
          subCategories: {
            create: src.subCategories.map((s) => ({ subCategoryId: s.subCategoryId })),
          },
        },
        select: { id: true },
      });
    });

    revalidateProductCaches();
    return toActionState("SUCCESS", "Product duplicated", undefined, {
      id: created.id,
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
