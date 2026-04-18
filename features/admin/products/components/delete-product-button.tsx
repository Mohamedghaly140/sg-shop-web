"use client";

import { useState } from "react";
import { LucideTrash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { deleteProductAction } from "../actions/products.actions";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
  trigger?: React.ReactNode;
  onDeleted?: () => void;
};

export function DeleteProductButton({
  productId,
  productName,
  trigger,
  onDeleted,
}: DeleteProductButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    const formData = new FormData();
    formData.append("productId", productId);
    const result = await deleteProductAction(EMPTY_ACTION_STATE, formData);
    setIsPending(false);
    if (result.status === "SUCCESS") {
      toast.success(result.message);
      onDeleted?.();
    } else if (result.status === "ERROR" && result.message) {
      toast.error(result.message);
    }
  };

  return (
    <ConfirmDialog
      trigger={
        trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            disabled={isPending}
          >
            <LucideTrash2 className="w-4 h-4" />
          </Button>
        )
      }
      title="Delete product"
      description={`Delete "${productName}"? All images will be removed from Cloudinary. This cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
    />
  );
}
