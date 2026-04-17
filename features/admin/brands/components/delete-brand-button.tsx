"use client";

import { useActionState, useRef } from "react";
import { LucideTrash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import Form from "@/components/shared/form/form";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { deleteBrandAction } from "../actions/brands.actions";

type DeleteBrandButtonProps = {
  brandId: string;
  brandName: string;
};

export function DeleteBrandButton({
  brandId,
  brandName,
}: DeleteBrandButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [actionState, formAction] = useActionState(
    deleteBrandAction,
    EMPTY_ACTION_STATE,
  );

  return (
    <>
      <Form
        ref={formRef}
        action={formAction}
        actionState={actionState}
        suppressBuiltInToasts
        className="hidden"
      >
        <input type="hidden" name="brandId" value={brandId} />
      </Form>
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
        title="Delete Brand"
        description={`Delete "${brandName}"? Products linked to this brand will no longer be associated with it.`}
        confirmLabel="Delete"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
