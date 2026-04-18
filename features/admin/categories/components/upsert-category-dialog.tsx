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
import { createCategoryAction, updateCategoryAction } from "../actions/categories.actions";
import type { Category } from "@/generated/prisma/client";

type UpsertCategoryDialogProps =
  | { mode: "create"; trigger?: React.ReactNode }
  | {
      mode: "edit";
      category: Pick<Category, "id" | "name" | "slug" | "imageUrl">;
      trigger?: React.ReactNode;
    };

export function UpsertCategoryDialog(props: UpsertCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const category = props.mode === "edit" ? props.category : null;

  const action = props.mode === "create" ? createCategoryAction : updateCategoryAction;
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button size="sm">
            <LucidePlus className="w-4 h-4" />
            New Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Create Category" : "Edit Category"}
          </DialogTitle>
        </DialogHeader>

        <Form action={formAction} actionState={actionState} onSuccess={() => setOpen(false)}>
          {category && <input type="hidden" name="categoryId" value={category.id} />}

          <FormControl
            label="Name"
            name="name"
            placeholder="e.g. Dresses"
            actionState={actionState}
            defaultValue={actionState.payload?.name ?? category?.name ?? ""}
          />

          <FormControl
            label="Cover Image URL"
            name="imageUrl"
            type="url"
            placeholder="https://…"
            actionState={actionState}
            defaultValue={actionState.payload?.imageUrl ?? category?.imageUrl ?? ""}
          />

          <SubmitButton
            label={props.mode === "create" ? "Create Category" : "Save Changes"}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
