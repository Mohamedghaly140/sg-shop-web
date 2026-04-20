"use client";

import { useActionState, useRef } from "react";
import { LucideTrash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { useActionFeedback } from "@/components/shared/form/hooks/use-action-feedback";
import { deleteUserAction } from "@/features/admin/users/actions/deleteUser";

type DeleteUserButtonProps = {
  userId: string;
  userName: string;
};

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [actionState, formAction] = useActionState(
    deleteUserAction,
    EMPTY_ACTION_STATE,
  );

  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message) {
        toast.success(actionState.message);
      }
    },
    onError: ({ actionState }) => {
      toast.error(actionState.message || "Failed to delete user");
    },
  });

  return (
    <>
      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="userId" value={userId} />
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
        title="Delete User"
        description={`Delete "${userName}"? This will permanently remove the account and all associated data.`}
        confirmLabel="Delete"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
