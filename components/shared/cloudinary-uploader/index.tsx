"use client";

import Image from "next/image";
import {
  LucideImagePlus,
  LucideLoader2,
  LucideUpload,
  LucideX,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UploadedImage = {
  imageId: string;
  imageUrl: string;
};

type CloudinaryUploaderProps = {
  signatureEndpoint: string;
  folder?: string;
  value: UploadedImage | null;
  onChange: (value: UploadedImage | null) => void;
  onRequestRemove?: (value: UploadedImage) => Promise<void> | void;
  label?: string;
  className?: string;
  aspectRatio?: "square" | "portrait" | "landscape";
  disabled?: boolean;
};

const ASPECT_CLASS: Record<
  NonNullable<CloudinaryUploaderProps["aspectRatio"]>,
  string
> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-video",
};

export function CloudinaryUploader({
  signatureEndpoint,
  folder,
  value,
  onChange,
  onRequestRemove,
  label = "Upload image",
  className,
  aspectRatio = "square",
  disabled = false,
}: CloudinaryUploaderProps) {
  const handleRemove = useCallback(async () => {
    if (!value) return;
    if (onRequestRemove) {
      await onRequestRemove(value);
    }
    onChange(null);
  }, [value, onChange, onRequestRemove]);

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-md border bg-muted",
            ASPECT_CLASS[aspectRatio],
          )}
        >
          <Image
            src={value.imageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 size-7"
            onClick={handleRemove}
            disabled={disabled}
          >
            <LucideX className="size-4" />
          </Button>
        </div>
      ) : (
        <CldUploadWidget
          signatureEndpoint={signatureEndpoint}
          options={{
            sources: ["local", "url", "camera"],
            multiple: false,
            folder,
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxFileSize: 5_000_000,
          }}
          onSuccess={(result, { widget }) => {
            if (result?.event !== "success") return;
            const info = result.info;
            if (
              typeof info === "object" &&
              info &&
              "secure_url" in info &&
              "public_id" in info
            ) {
              onChange({
                imageId: String(info.public_id),
                imageUrl: String(info.secure_url),
              });
              widget.close();
            }
          }}
        >
          {({ open, isLoading }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={disabled || isLoading}
              className={cn(
                "group relative flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/30 text-muted-foreground transition hover:border-foreground/40 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60",
                ASPECT_CLASS[aspectRatio],
              )}
            >
              {isLoading ? (
                <LucideLoader2 className="size-6 animate-spin" />
              ) : (
                <LucideImagePlus className="size-6" />
              )}
              <span className="text-xs font-medium">{label}</span>
              <span className="text-[11px]">PNG, JPG, WEBP · up to 5MB</span>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}

type CloudinaryMultiUploaderProps = {
  signatureEndpoint: string;
  folder?: string;
  onUploaded: (images: UploadedImage[]) => void;
  label?: string;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
};

export function CloudinaryMultiUploader({
  signatureEndpoint,
  folder,
  onUploaded,
  label = "Upload gallery images",
  maxFiles = 8,
  className,
  disabled = false,
}: CloudinaryMultiUploaderProps) {
  return (
    <CldUploadWidget
      signatureEndpoint={signatureEndpoint}
      options={{
        sources: ["local", "url"],
        multiple: true,
        maxFiles,
        folder,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5_000_000,
      }}
      onQueuesEnd={(_result, { widget }) => {
        widget.close();
      }}
      onSuccess={result => {
        if (result?.event !== "success") return;
        const info = result.info;
        if (
          typeof info === "object" &&
          info &&
          "secure_url" in info &&
          "public_id" in info
        ) {
          onUploaded([
            {
              imageId: String(info.public_id),
              imageUrl: String(info.secure_url),
            },
          ]);
        }
      }}
    >
      {({ open, isLoading }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => open()}
          disabled={disabled || isLoading}
          className={className}
        >
          {isLoading ? (
            <LucideLoader2 className="size-4 animate-spin" />
          ) : (
            <LucideUpload className="size-4" />
          )}
          {label}
        </Button>
      )}
    </CldUploadWidget>
  );
}
