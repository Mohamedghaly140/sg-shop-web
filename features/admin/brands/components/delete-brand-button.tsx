"use client";

import { useState } from "react";
import { LucideTrash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { deleteBrandAction } from "@/features/admin/brands/actions/deleteBrand";

type DeleteBrandButtonProps = {
  brandId: string;
  brandName: string;
};

export function DeleteBrandButton({ brandId, brandName }: DeleteBrandButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    const formData = new FormData();
    formData.append("brandId", brandId);
    const result = await deleteBrandAction(EMPTY_ACTION_STATE, formData);
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
      title="Delete Brand"
      description={`Delete "${brandName}"? Products linked to this brand will no longer be associated with it.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
    />
  );
}
