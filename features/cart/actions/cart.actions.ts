"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { removeCartItem } from "../services/remove-cart-item";
import { updateCartItemQuantity } from "../services/update-cart-item";

const removeCartItemSchema = z.object({
  cartItemId: z.string().min(1),
  cartId: z.string().min(1),
});

export async function removeCartItemAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { cartItemId, cartId } = removeCartItemSchema.parse({
      cartItemId: formData.get("cartItemId"),
      cartId: formData.get("cartId"),
    });

    await removeCartItem({ cartItemId, cartId });
    revalidatePath("/cart");
    return toActionState("SUCCESS", "Item removed");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1),
  cartId: z.string().min(1),
  quantity: z.coerce.number().int().min(0),
});

export async function updateCartItemAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { cartItemId, cartId, quantity } = updateCartItemSchema.parse({
      cartItemId: formData.get("cartItemId"),
      cartId: formData.get("cartId"),
      quantity: formData.get("quantity"),
    });

    await updateCartItemQuantity({ cartItemId, cartId, quantity });
    revalidatePath("/cart");
    return toActionState("SUCCESS", "Cart updated");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
