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
import { createBrandAction, updateBrandAction } from "../actions/brands.actions";
import type { Brand } from "@/generated/prisma/client";

type UpsertBrandDialogProps =
  | { mode: "create"; trigger?: React.ReactNode }
  | {
      mode: "edit";
      brand: Pick<Brand, "id" | "name" | "slug" | "imageUrl">;
      trigger?: React.ReactNode;
    };

export function UpsertBrandDialog(props: UpsertBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const brand = props.mode === "edit" ? props.brand : null;

  const action = props.mode === "create" ? createBrandAction : updateBrandAction;
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button size="sm">
            <LucidePlus className="w-4 h-4" />
            New Brand
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? "Create Brand" : "Edit Brand"}</DialogTitle>
        </DialogHeader>

        <Form action={formAction} actionState={actionState} onSuccess={() => setOpen(false)}>
          {brand && <input type="hidden" name="brandId" value={brand.id} />}

          <FormControl
            label="Name"
            name="name"
            placeholder="e.g. Acme Couture"
            actionState={actionState}
            defaultValue={actionState.payload?.name ?? brand?.name ?? ""}
          />

          <FormControl
            label="Slug"
            name="slug"
            placeholder="Leave blank to generate from name"
            actionState={actionState}
            defaultValue={actionState.payload?.slug ?? brand?.slug ?? ""}
          />
          <p className="-mt-2 text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens only. Leave blank on create to auto-generate from
            the name.
          </p>

          <FormControl
            label="Logo URL"
            name="imageUrl"
            type="url"
            placeholder="https://…"
            actionState={actionState}
            defaultValue={actionState.payload?.imageUrl ?? brand?.imageUrl ?? ""}
          />

          <SubmitButton label={props.mode === "create" ? "Create Brand" : "Save Changes"} />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
