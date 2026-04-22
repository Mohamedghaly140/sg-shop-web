"use client";

import { useState } from "react";
import { LucideTrash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { deleteCouponAction } from "@/features/admin/coupons/actions/deleteCoupon";

type DeleteCouponButtonProps = {
  couponId: string;
  couponName: string;
};

export function DeleteCouponButton({ couponId, couponName }: DeleteCouponButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    const formData = new FormData();
    formData.append("couponId", couponId);
    const result = await deleteCouponAction(EMPTY_ACTION_STATE, formData);
    setIsPending(false);
    if (result.status === "SUCCESS") {
      toast.success(result.message);
    } else if (result.status === "ERROR" && result.message) {
      toast.error(result.message);
    }
  };

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          disabled={isPending}
        >
          <LucideTrash2 className="w-4 h-4" />
        </Button>
      }
      title="Delete Coupon"
      description={`Delete coupon "${couponName}"? Orders that used this code will retain their applied discount but will no longer reference this coupon.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
    />
  );
}
