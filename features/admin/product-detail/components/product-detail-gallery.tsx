"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductDetailGalleryProps = {
  mainImageUrl: string;
  galleryImages: { id: string; imageUrl: string }[];
  alt: string;
};

export function ProductDetailGallery({
  mainImageUrl,
  galleryImages,
  alt,
}: ProductDetailGalleryProps) {
  const all = [{ id: "main", imageUrl: mainImageUrl }, ...galleryImages];
  const [active, setActive] = useState(all[0]?.imageUrl);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        {active && (
          <Image
            src={active}
            alt={alt}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 480px"
          />
        )}
      </div>
      {all.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {all.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(img.imageUrl)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border bg-muted transition",
                active === img.imageUrl
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.imageUrl}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
