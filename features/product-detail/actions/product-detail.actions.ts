"use server";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { addToCart } from "@/features/cart/services/add-to-cart";
import {
  CART_SESSION_COOKIE,
  CART_SESSION_MAX_AGE,
} from "@/features/cart/constants";
import { prisma } from "@/lib/prisma";

const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export async function addToCartAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { userId } = await auth();

    const { productId, size, color, quantity } = addToCartSchema.parse({
      productId: formData.get("productId"),
      size: formData.get("size") || undefined,
      color: formData.get("color") || undefined,
      quantity: formData.get("quantity"),
    });

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;

    const { newSessionToken } = await addToCart({
      productId,
      userId,
      sessionToken,
      size: size ?? null,
      color: color ?? null,
      quantity,
    });

    if (newSessionToken) {
      cookieStore.set(CART_SESSION_COOKIE, newSessionToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: CART_SESSION_MAX_AGE,
      });
    }

    return toActionState("SUCCESS", "Item added to cart");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

const toggleWishlistSchema = z.object({
  productId: z.string().min(1),
});

export async function toggleWishlistAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return toActionState("ERROR", "Sign in to save items to your wishlist");
    }

    const { productId } = toggleWishlistSchema.parse({
      productId: formData.get("productId"),
    });

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: { slug: true },
    });

    const existing = await prisma.userWishlist.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { userId: true },
    });

    const added = !existing;

    if (existing) {
      await prisma.userWishlist.delete({
        where: { userId_productId: { userId, productId } },
      });
    } else {
      await prisma.userWishlist.create({ data: { userId, productId } });
    }

    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/account/wishlist");
    return toActionState("SUCCESS", added ? "Saved to wishlist" : "Removed from wishlist");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
