"use client";

import { useState } from "react";
import { LucideTrash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { deleteSubcategoryAction } from "@/features/admin/categories/actions/deleteSubcategory";

type DeleteSubcategoryButtonProps = {
  subcategoryId: string;
  subcategoryName: string;
};

export function DeleteSubcategoryButton({ subcategoryId, subcategoryName }: DeleteSubcategoryButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    const formData = new FormData();
    formData.append("subcategoryId", subcategoryId);
    const result = await deleteSubcategoryAction(EMPTY_ACTION_STATE, formData);
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
      title="Delete Subcategory"
      description={`Delete "${subcategoryName}"? This cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
    />
  );
}
