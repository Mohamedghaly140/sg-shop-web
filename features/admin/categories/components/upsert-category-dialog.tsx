"use client";

import { useActionState, useEffect, useState } from "react";
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
import {
  CloudinaryUploader,
  type UploadedImage,
} from "@/components/shared/cloudinary-uploader";
import { CLOUDINARY_CATEGORIES_FOLDER } from "@/lib/cloudinary-public";
import { createCategoryAction } from "@/features/admin/categories/actions/createCategory";
import { updateCategoryAction } from "@/features/admin/categories/actions/updateCategory";
import type { Category } from "@/generated/prisma/client";

type UpsertCategoryDialogProps =
  | { mode: "create"; trigger?: React.ReactNode }
  | {
      mode: "edit";
      category: Pick<Category, "id" | "name" | "slug" | "imageId" | "imageUrl">;
      trigger?: React.ReactNode;
    };

export function UpsertCategoryDialog(props: UpsertCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const category = props.mode === "edit" ? props.category : null;

  const action = props.mode === "create" ? createCategoryAction : updateCategoryAction;
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  const [image, setImage] = useState<UploadedImage | null>(null);

  useEffect(() => {
    if (open) {
      setImage(
        category?.imageId && category?.imageUrl
          ? { imageId: category.imageId, imageUrl: category.imageUrl }
          : null,
      );
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button size="sm">
            <LucidePlus className="w-4 h-4" />
            New Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
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

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cover Image</p>
            <CloudinaryUploader
              signatureEndpoint="/api/sign-cloudinary-params"
              folder={CLOUDINARY_CATEGORIES_FOLDER}
              value={image}
              onChange={setImage}
              label="Upload cover image"
              aspectRatio="square"
            />
          </div>

          {image && (
            <>
              <input type="hidden" name="imageId" value={image.imageId} />
              <input type="hidden" name="imageUrl" value={image.imageUrl} />
            </>
          )}

          <SubmitButton
            label={props.mode === "create" ? "Create Category" : "Save Changes"}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
