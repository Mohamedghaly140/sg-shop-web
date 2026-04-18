"use client";

import { useState } from "react";
import { LucideBan } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { deactivateCouponAction } from "../actions/coupons.actions";

type DeactivateCouponButtonProps = {
  couponId: string;
};

export function DeactivateCouponButton({ couponId }: DeactivateCouponButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDeactivate = async () => {
    setIsPending(true);
    const formData = new FormData();
    formData.append("couponId", couponId);
    const result = await deactivateCouponAction(EMPTY_ACTION_STATE, formData);
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
          className="text-muted-foreground"
          disabled={isPending}
        >
          <LucideBan className="w-4 h-4" />
        </Button>
      }
      title="Deactivate Coupon"
      description="Deactivate this coupon? It will no longer be redeemable. You can re-activate it by editing and setting a new expiry date."
      confirmLabel="Deactivate"
      onConfirm={handleDeactivate}
    />
  );
}
