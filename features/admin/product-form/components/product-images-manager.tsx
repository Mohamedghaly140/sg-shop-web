"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideLoader2,
  LucideX,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  CloudinaryMultiUploader,
  type UploadedImage,
} from "@/components/shared/cloudinary-uploader";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { CLOUDINARY_PRODUCTS_FOLDER } from "@/lib/cloudinary-public";
import { deleteProductImageAction } from "@/features/admin/products/actions/deleteProductImage";
import { cn } from "@/lib/utils";

export type GalleryImage = UploadedImage & {
  productImageId?: string;
};

type ProductImagesManagerProps = {
  productId?: string;
  value: GalleryImage[];
  onChange: (next: GalleryImage[]) => void;
};

export function ProductImagesManager({
  productId,
  value,
  onChange,
}: ProductImagesManagerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Ref tracks the latest gallery so concurrent onSuccess callbacks
  // (one per uploaded file) always append to the up-to-date list instead
  // of overwriting each other via a stale prop closure.
  const latestValue = useRef(value);
  latestValue.current = value;

  const handleUploaded = (uploaded: UploadedImage[]) => {
    const next = [...latestValue.current];
    for (const u of uploaded) {
      if (!next.some(v => v.imageId === u.imageId)) next.push(u);
    }
    latestValue.current = next;
    onChange(next);
  };

  const handleRemove = async (idx: number) => {
    const img = value[idx];
    if (!img) return;
    if (img.productImageId && productId) {
      setDeletingId(img.productImageId);
      const fd = new FormData();
      fd.append("productId", productId);
      fd.append("productImageId", img.productImageId);
      const res = await deleteProductImageAction(EMPTY_ACTION_STATE, fd);
      setDeletingId(null);
      if (res.status === "ERROR") {
        toast.error(res.message || "Failed to remove image");
        return;
      }
    }
    onChange(value.filter((_, i) => i !== idx));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Gallery ({value.length})</p>
        <CloudinaryMultiUploader
          signatureEndpoint="/api/sign-cloudinary-params"
          folder={CLOUDINARY_PRODUCTS_FOLDER}
          onUploaded={handleUploaded}
          label="Add images"
          maxFiles={10}
        />
      </div>

      {value.length === 0 ? (
        <div className="rounded-md border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          No gallery images yet. Upload to show additional angles.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((img, i) => (
            <div
              key={img.imageId}
              className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
            >
              <Image
                src={img.imageUrl}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 200px"
              />
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100",
                  deletingId === img.productImageId && "opacity-100",
                )}
              >
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="size-7"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                  >
                    <LucideChevronUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="size-7"
                    onClick={() => move(i, 1)}
                    disabled={i === value.length - 1}
                  >
                    <LucideChevronDown className="size-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-7"
                  onClick={() => handleRemove(i)}
                  disabled={deletingId === img.productImageId}
                >
                  {deletingId === img.productImageId ? (
                    <LucideLoader2 className="size-3.5 animate-spin" />
                  ) : (
                    <LucideX className="size-3.5" />
                  )}
                </Button>
              </div>
              <span className="absolute top-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {value.map((img, i) => (
        <div key={`${img.imageId}-hidden`}>
          <input
            type="hidden"
            name={`images[${i}][imageId]`}
            value={img.imageId}
          />
          <input
            type="hidden"
            name={`images[${i}][imageUrl]`}
            value={img.imageUrl}
          />
          <input type="hidden" name={`images[${i}][sortOrder]`} value={i} />
        </div>
      ))}
    </div>
  );
}
