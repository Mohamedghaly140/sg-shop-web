"use client";

import { useActionState, useRef } from "react";
import { LucideTrash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { useActionFeedback } from "@/components/shared/form/hooks/use-action-feedback";
import { deleteCouponAction } from "../actions/coupons.actions";

type DeleteCouponButtonProps = {
  couponId: string;
  couponName: string;
};

export function DeleteCouponButton({ couponId, couponName }: DeleteCouponButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [actionState, formAction] = useActionState(
    deleteCouponAction,
    EMPTY_ACTION_STATE
  );

  useActionFeedback(actionState, {
    onSuccess: () => {},
    onError: ({ actionState }) => {
      toast.error(actionState.message || "Failed to delete coupon");
    },
  });

  return (
    <>
      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="couponId" value={couponId} />
      </form>
      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
          >
            <LucideTrash2 className="w-4 h-4" />
          </Button>
        }
        title="Delete Coupon"
        description={`Delete coupon "${couponName}"? Orders that used this code will retain their applied discount but will no longer reference this coupon.`}
        confirmLabel="Delete"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
