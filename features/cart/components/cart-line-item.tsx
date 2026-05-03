"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import Form from "@/components/shared/form/form";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import {
  updateCartItemAction,
  removeCartItemAction,
} from "@/features/cart/actions/cart.actions";
import type { CartItemData } from "@/features/cart/services/get-cart";

type CartLineItemProps = {
  item: CartItemData;
  cartId: string;
};

export function CartLineItem({ item, cartId }: CartLineItemProps) {
  const [updateState, updateFormAction, isUpdating] = useActionState(
    updateCartItemAction,
    EMPTY_ACTION_STATE
  );
  const [removeState, removeFormAction, isRemoving] = useActionState(
    removeCartItemAction,
    EMPTY_ACTION_STATE
  );

  const isPending = isUpdating || isRemoving;
  const lineTotal = (Number(item.price) * item.quantity).toLocaleString();

  return (
    <div
      className={`flex gap-4 sm:gap-6 py-6 transition-opacity ${
        isPending ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Thumbnail */}
      <Link href={`/products/${item.product.slug}`} className="shrink-0">
        <div className="relative w-20 h-[100px] bg-muted overflow-hidden">
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <Link href={`/products/${item.product.slug}`}>
          <p className="font-sans text-sm font-medium text-foreground tracking-wide line-clamp-2 hover:text-gold transition-colors">
            {item.product.name}
          </p>
        </Link>

        {(item.color || item.size) && (
          <p className="font-sans text-xs text-muted-foreground">
            {[item.size, item.color].filter(Boolean).join(" · ")}
          </p>
        )}

        <p className="font-sans text-sm text-muted-foreground">
          LE {Number(item.price).toLocaleString()} each
        </p>

        {/* Quantity stepper + remove */}
        <div className="flex items-center justify-between mt-auto pt-2 flex-wrap gap-3">
          {/* stepper: two submit buttons with different name="quantity" values */}
          <Form
            action={updateFormAction}
            actionState={updateState}
            className="flex-row items-center gap-0 w-auto border border-border"
          >
            <input type="hidden" name="cartItemId" value={item.id} />
            <input type="hidden" name="cartId" value={cartId} />
            <button
              type="submit"
              name="quantity"
              value={item.quantity - 1}
              disabled={isPending}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            >
              −
            </button>
            <span className="w-8 h-8 flex items-center justify-center font-sans text-sm text-foreground border-x border-border select-none">
              {item.quantity}
            </span>
            <button
              type="submit"
              name="quantity"
              value={item.quantity + 1}
              disabled={isPending}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            >
              +
            </button>
          </Form>

          <Form
            action={removeFormAction}
            actionState={removeState}
            className="w-auto gap-0"
          >
            <input type="hidden" name="cartItemId" value={item.id} />
            <input type="hidden" name="cartId" value={cartId} />
            <button
              type="submit"
              disabled={isPending}
              className="font-sans text-[0.6875rem] tracking-[0.1em] uppercase text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
            >
              Remove
            </button>
          </Form>
        </div>
      </div>

      {/* Line total */}
      <div className="hidden sm:flex shrink-0 items-start">
        <p className="font-sans text-sm text-foreground">LE {lineTotal}</p>
      </div>
    </div>
  );
}
