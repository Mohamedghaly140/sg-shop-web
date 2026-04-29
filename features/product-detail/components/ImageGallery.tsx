"use client";

import { useState } from "react";
import Image from "next/image";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

type GalleryImage = { imageUrl: string };

type ImageGalleryProps = {
  primaryImageUrl: string;
  additionalImages: GalleryImage[];
  productName: string;
};

export function ImageGallery({
  primaryImageUrl,
  additionalImages,
  productName,
}: ImageGalleryProps) {
  const images: GalleryImage[] = [
    { imageUrl: primaryImageUrl },
    ...additionalImages,
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex(i => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="flex gap-4">
      {/* Desktop: vertical thumbnail strip */}
      {images.length > 1 && (
        <div className="hidden lg:flex flex-col gap-2 w-[72px] shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[3/4] overflow-hidden border transition-colors duration-200 ${
                activeIndex === idx ? "border-foreground" : "border-transparent"
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={`${productName} view ${idx + 1}`}
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={images[activeIndex].imageUrl}
          alt={productName}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {/* Mobile prev/next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 text-foreground"
            >
              <LucideChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 text-foreground"
            >
              <LucideChevronRight size={18} strokeWidth={1.5} />
            </button>

            {/* Mobile dots indicator */}
            <div className="lg:hidden absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                    activeIndex === idx ? "bg-foreground" : "bg-foreground/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
