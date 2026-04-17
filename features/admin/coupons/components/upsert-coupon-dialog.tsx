"use client";

import { useActionState, useState } from "react";
import { format } from "date-fns";
import { LucidePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Form from "@/components/shared/form/form";
import FormControl from "@/components/shared/form-control";
import SubmitButton from "@/components/shared/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { createCouponAction, updateCouponAction } from "../actions/coupons.actions";
import type { CouponRow } from "../services/get-coupons";

type UpsertCouponDialogProps =
  | { mode: "create"; trigger?: React.ReactNode }
  | {
      mode: "edit";
      coupon: Pick<
        CouponRow,
        "id" | "name" | "discount" | "maxUsage" | "expire"
      >;
      trigger?: React.ReactNode;
    };

export function UpsertCouponDialog(props: UpsertCouponDialogProps) {
  const [open, setOpen] = useState(false);
  const coupon = props.mode === "edit" ? props.coupon : null;

  const action = props.mode === "create" ? createCouponAction : updateCouponAction;
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button size="sm">
            <LucidePlus className="w-4 h-4" />
            New Coupon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Create Coupon" : "Edit Coupon"}
          </DialogTitle>
        </DialogHeader>

        <Form
          action={formAction}
          actionState={actionState}
          onSuccess={() => setOpen(false)}
        >
          {coupon && (
            <input type="hidden" name="couponId" value={coupon.id} />
          )}

          <FormControl
            label="Code"
            name="name"
            placeholder="SAVE20"
            actionState={actionState}
            defaultValue={actionState.payload?.name ?? coupon?.name ?? ""}
            readOnly={props.mode === "edit"}
            className={props.mode === "edit" ? "opacity-50 cursor-not-allowed" : "uppercase"}
            style={{ textTransform: "uppercase" }}
          />

          <FormControl
            label="Discount (%)"
            name="discount"
            type="number"
            placeholder="20"
            inputMode="numeric"
            min="1"
            max="70"
            actionState={actionState}
            defaultValue={
              actionState.payload?.discount ??
              (coupon ? String(Number(coupon.discount)) : "")
            }
          />

          <FormControl
            label="Expiry Date"
            name="expire"
            type="date"
            actionState={actionState}
            defaultValue={
              actionState.payload?.expire ??
              (coupon ? format(coupon.expire, "yyyy-MM-dd") : "")
            }
          />

          <FormControl
            label="Max Usage (0 = unlimited)"
            name="maxUsage"
            type="number"
            placeholder="0"
            inputMode="numeric"
            min="0"
            actionState={actionState}
            defaultValue={
              actionState.payload?.maxUsage ??
              (coupon ? String(coupon.maxUsage) : "0")
            }
          />

          <SubmitButton
            label={props.mode === "create" ? "Create Coupon" : "Save Changes"}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
