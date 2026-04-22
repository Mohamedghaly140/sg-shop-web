"use client";

import { useActionState, useState } from "react";
import { LucidePencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Form from "@/components/shared/form/form";
import SubmitButton from "@/components/shared/submit-button";
import {
  EMPTY_ACTION_STATE,
} from "@/components/shared/form/utils/to-action-state";
import { OrderStatus } from "@/generated/prisma/enums";
import { updateOrderStatusAction } from "../actions/updateOrderStatus";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

type UpdateOrderStatusDialogProps = {
  orderId: string;
  currentStatus: OrderStatus;
  currentNotes?: string | null;
};

export function UpdateOrderStatusDialog({
  orderId,
  currentStatus,
  currentNotes,
}: UpdateOrderStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [actionState, formAction] = useActionState(
    updateOrderStatusAction,
    EMPTY_ACTION_STATE,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <LucidePencil className="w-4 h-4" />
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <Form
          action={formAction}
          actionState={actionState}
          onSuccess={() => setOpen(false)}
        >
          <input type="hidden" name="orderId" value={orderId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              defaultValue={actionState.payload?.status ?? currentStatus}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add internal notes about this order…"
              rows={3}
              defaultValue={actionState.payload?.notes ?? currentNotes ?? ""}
            />
          </div>

          <SubmitButton label="Save Changes" />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
