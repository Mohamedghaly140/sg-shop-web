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
import { CLOUDINARY_BRANDS_FOLDER } from "@/lib/cloudinary-public";
import { createBrandAction, updateBrandAction } from "../actions/brands.actions";
import type { Brand } from "@/generated/prisma/client";

type UpsertBrandDialogProps =
  | { mode: "create"; trigger?: React.ReactNode }
  | {
      mode: "edit";
      brand: Pick<Brand, "id" | "name" | "slug" | "imageId" | "imageUrl">;
      trigger?: React.ReactNode;
    };

export function UpsertBrandDialog(props: UpsertBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const brand = props.mode === "edit" ? props.brand : null;

  const action = props.mode === "create" ? createBrandAction : updateBrandAction;
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  const [image, setImage] = useState<UploadedImage | null>(null);

  useEffect(() => {
    if (open) {
      setImage(
        brand?.imageId && brand?.imageUrl
          ? { imageId: brand.imageId, imageUrl: brand.imageUrl }
          : null,
      );
    }
  }, [open, brand]);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button size="sm">
            <LucidePlus className="w-4 h-4" />
            New Brand
          </Button>
        )}
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
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

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Logo</p>
            <CloudinaryUploader
              signatureEndpoint="/api/sign-cloudinary-params"
              folder={CLOUDINARY_BRANDS_FOLDER}
              value={image}
              onChange={setImage}
              label="Upload logo"
              aspectRatio="square"
            />
          </div>

          {image && (
            <>
              <input type="hidden" name="imageId" value={image.imageId} />
              <input type="hidden" name="imageUrl" value={image.imageUrl} />
            </>
          )}

          <SubmitButton label={props.mode === "create" ? "Create Brand" : "Save Changes"} />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
