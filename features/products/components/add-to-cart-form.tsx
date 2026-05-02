"use client";

import { useActionState } from "react";

import Form from "@/components/shared/form/form";
import SubmitButton from "@/components/shared/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { cn } from "@/lib/utils";
import { addToCartAction } from "../actions/products.actions";

type AddToCartFormProps = {
  productId: string;
  isSoldOut: boolean;
  layout: "grid" | "list";
  hasRatings: boolean;
};

export function AddToCartForm({
  productId,
  isSoldOut,
  layout,
  hasRatings,
}: AddToCartFormProps) {
  const [actionState, formAction] = useActionState(
    addToCartAction,
    EMPTY_ACTION_STATE
  );

  return (
    <Form
      action={formAction}
      actionState={actionState}
      className={layout === "list" ? "w-fit" : "w-full"}
    >
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton
        label={isSoldOut ? "Sold Out" : "Add to Cart"}
        disabled={isSoldOut}
        size={layout === "list" ? "sm" : "default"}
        className={cn(
          "text-[0.6875rem] tracking-[0.15em] uppercase hover:bg-gold transition-colors duration-300",
          layout === "grid"
            ? cn("w-full py-2.5", !hasRatings && "mt-3")
            : "w-fit mt-3"
        )}
      />
    </Form>
  );
}
