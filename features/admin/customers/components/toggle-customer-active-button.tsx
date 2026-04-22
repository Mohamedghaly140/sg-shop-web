"use client";

import { useState } from "react";
import { LucideLock, LucideUnlock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { toggleCustomerActiveAction } from "../actions/toggleCustomerActive";

type ToggleCustomerActiveButtonProps = {
  customerId: string;
  active: boolean;
};

export function ToggleCustomerActiveButton({
  customerId,
  active,
}: ToggleCustomerActiveButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    setIsPending(true);
    const formData = new FormData();
    formData.append("customerId", customerId);
    formData.append("active", String(!active));
    const result = await toggleCustomerActiveAction(EMPTY_ACTION_STATE, formData);
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
          {active ? (
            <LucideLock className="w-4 h-4" />
          ) : (
            <LucideUnlock className="w-4 h-4" />
          )}
          <span className="sr-only">{active ? "Deactivate customer" : "Activate customer"}</span>
        </Button>
      }
      title={active ? "Deactivate Customer" : "Activate Customer"}
      description={
        active
          ? "This will ban the customer from signing in. Their data and orders are preserved."
          : "This will restore the customer's access to their account."
      }
      confirmLabel={active ? "Deactivate" : "Activate"}
      onConfirm={handleToggle}
    />
  );
}
