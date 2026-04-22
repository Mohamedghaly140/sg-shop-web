"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { destroyAssets } from "@/lib/cloudinary";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireManagerOrAdmin } from "@/lib/require-role";
import { makeSlug, allocateUniqueSlug } from "@/lib/slug";
import {
  computePriceAfterDiscount,
  parseProductFormData,
  productIdFormSchema,
  revalidateProductCaches,
} from "./productActionHelpers";

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireManagerOrAdmin();
    const productId = productIdFormSchema.parse(formData.get("productId"));
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
