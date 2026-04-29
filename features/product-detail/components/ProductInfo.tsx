"use client";

import { useEffect, useRef, useState } from "react";
import { LucideHeart } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ProductInfoProps = {
  name: string;
  description: string;
  price: string;
  discount: string;
  priceAfterDiscount: string;
  sizes: string[];
  colors: string[];
  quantity: number;
  categoryName: string;
  inWishlist: boolean;
};

export function ProductInfo({
  name,
  description,
  price,
  discount,
  priceAfterDiscount,
  sizes,
  colors,
  quantity,
  categoryName,
  inWishlist,
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0] ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addToCartRef = useRef<HTMLButtonElement>(null);

  const isSoldOut = quantity === 0;
  const hasDiscount = Number(discount) > 0;
  const discountPercent = hasDiscount ? Math.round(Number(discount)) : 0;

  useEffect(() => {
    const el = addToCartRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6 lg:sticky lg:top-36">
        {/* Category label */}
        <p className="font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-gold">
          {categoryName}
        </p>

        {/* Product name */}
        <h1 className="font-heading text-3xl leading-tight text-foreground">
          {name}
        </h1>

        {/* Price row */}
        <div className="flex items-center gap-3">
          <span className="font-sans text-base text-foreground">
            LE {Number(priceAfterDiscount).toLocaleString()}
          </span>
          {hasDiscount && (
            <>
              <span className="font-sans text-sm text-muted-foreground line-through">
                LE {Number(price).toLocaleString()}
              </span>
              <span className="font-sans text-[0.6875rem] tracking-[0.1em] uppercase bg-gold text-gold-foreground px-2 py-0.5">
                {discountPercent}% Off
              </span>
            </>
          )}
        </div>

        {/* Color selector */}
        {colors.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="font-sans text-xs text-foreground">
              Color:{" "}
              <span className="font-medium capitalize">{selectedColor}</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full border border-border transition-all duration-200 ${
                    selectedColor === color
                      ? "ring-1 ring-offset-2 ring-foreground"
                      : ""
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {sizes.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <p className="font-sans text-xs text-foreground">Size</p>
              <button className="font-sans text-[0.625rem] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-current pb-px">
                Size Guide
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3rem] px-3 py-2 font-sans text-xs border transition-colors duration-200 ${
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart */}
        <button
          ref={addToCartRef}
          type="button"
          disabled={isSoldOut}
          className="w-full font-sans text-[0.6875rem] tracking-[0.2em] uppercase py-3.5 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 bg-foreground text-background hover:bg-gold"
        >
          {isSoldOut ? "Sold Out" : "Add to Cart"}
        </button>

        {/* Save to Wishlist */}
        <button
          type="button"
          className="w-full font-sans text-[0.6875rem] tracking-[0.2em] uppercase py-3.5 border border-border text-foreground hover:border-foreground transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <LucideHeart
            size={14}
            strokeWidth={1.5}
            className={inWishlist ? "fill-foreground" : ""}
          />
          {inWishlist ? "Saved to Wishlist" : "Save to Wishlist"}
        </button>

        {/* Accordion — Description, Care, Delivery */}
        <Accordion type="multiple" className="border-t border-border">
          <AccordionItem value="description" className="border-border">
            <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase text-foreground hover:no-underline">
              Description
            </AccordionTrigger>
            <AccordionContent className="font-sans text-sm text-muted-foreground leading-relaxed">
              {description}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="care" className="border-border">
            <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase text-foreground hover:no-underline">
              Care &amp; Materials
            </AccordionTrigger>
            <AccordionContent className="font-sans text-sm text-muted-foreground leading-relaxed">
              Dry clean only. Store in the dust bag provided. Avoid prolonged
              exposure to direct sunlight. Handle with care.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delivery" className="border-border">
            <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase text-foreground hover:no-underline">
              Delivery &amp; Returns
            </AccordionTrigger>
            <AccordionContent className="font-sans text-sm text-muted-foreground leading-relaxed">
              Standard delivery 3–5 business days. Express delivery 1–2 business
              days. Free returns within 14 days of receipt. Items must be unworn
              and in original packaging.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Mobile sticky bottom bar */}
      {showStickyBar && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border px-4 py-3 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-sans text-sm text-foreground">
              LE {Number(priceAfterDiscount).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="font-sans text-xs text-muted-foreground line-through">
                LE {Number(price).toLocaleString()}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={isSoldOut}
            className="flex-1 font-sans text-[0.6875rem] tracking-[0.2em] uppercase py-3 bg-foreground text-background hover:bg-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSoldOut ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      )}
    </>
  );
}
