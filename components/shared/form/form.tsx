import { useActionFeedback } from "@/components/shared/form/hooks/use-action-feedback";
import { ActionState } from "@/components/shared/form/utils/to-action-state";
import { cn } from "@/lib/utils";
import React from "react";
import { toast } from "sonner";

type FormProps = {
  children: React.ReactNode;
  actionState: ActionState;
  action: (formData: FormData) => void;
  className?: string;
  onSuccess?: (actionState: ActionState) => void;
  onError?: (actionState: ActionState) => void;
};

const Form = ({
  children,
  action,
  actionState,
  className,
  onSuccess,
  onError,
}: FormProps) => {
  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message) {
        toast.success(actionState.message);
      }
      onSuccess?.(actionState);
    },
    onError: ({ actionState }) => {
      if (actionState.message) {
        toast.error(actionState.message);
      }
      onError?.(actionState);
    },
  });

  return (
    <form
      action={action}
      className={cn("flex flex-col gap-4 w-full", className)}
    >
      {children}
    </form>
  );
};

export default Form;
