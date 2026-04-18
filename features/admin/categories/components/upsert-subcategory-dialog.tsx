"use client";

import { useActionState, useState } from "react";
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
import { createSubcategoryAction, updateSubcategoryAction } from "../actions/subcategories.actions";
import type { SubCategory } from "@/generated/prisma/client";

type UpsertSubcategoryDialogProps =
  | { mode: "create"; categoryId: string; trigger?: React.ReactNode }
  | {
      mode: "edit";
      subcategory: Pick<SubCategory, "id" | "name" | "slug">;
      trigger?: React.ReactNode;
    };

export function UpsertSubcategoryDialog(props: UpsertSubcategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const subcategory = props.mode === "edit" ? props.subcategory : null;

  const action = props.mode === "create" ? createSubcategoryAction : updateSubcategoryAction;
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button size="sm" variant="outline">
            <LucidePlus className="w-4 h-4" />
            New Subcategory
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Create Subcategory" : "Edit Subcategory"}
          </DialogTitle>
        </DialogHeader>

        <Form action={formAction} actionState={actionState} onSuccess={() => setOpen(false)}>
          {props.mode === "create" && (
            <input type="hidden" name="categoryId" value={props.categoryId} />
          )}
          {subcategory && <input type="hidden" name="subcategoryId" value={subcategory.id} />}

          <FormControl
            label="Name"
            name="name"
            placeholder="e.g. Evening Dresses"
            actionState={actionState}
            defaultValue={actionState.payload?.name ?? subcategory?.name ?? ""}
          />

          <SubmitButton
            label={props.mode === "create" ? "Create Subcategory" : "Save Changes"}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
