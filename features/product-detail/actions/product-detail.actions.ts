"use server";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
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

const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export async function addToCartAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { userId } = await auth();

    const { productId } = addToCartSchema.parse({
      productId: formData.get("productId"),
    });

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;

    const { newSessionToken } = await addToCart({ productId, userId, sessionToken });

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
