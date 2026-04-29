import Image from "next/image";
import Link from "next/link";
import { LucideHeart, LucideStar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StorefrontProductItem } from "../types";

const NEW_PRODUCT_DAYS = 14;

type ProductCardProps = {
  product: StorefrontProductItem;
  layout: "grid" | "list";
  inWishlist?: boolean;
};

function getBadge(product: StorefrontProductItem): "sale" | "new" | null {
  if (Number(product.discount) > 0) return "sale";
  const ageMs = Date.now() - new Date(product.createdAt).getTime();
  if (ageMs < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000) return "new";
  return null;
}

export function ProductCard({ product, layout, inWishlist }: ProductCardProps) {
  const isSoldOut = product.quantity === 0;
  const hasDiscount = Number(product.discount) > 0;
  const badge = layout === "grid" ? getBadge(product) : null;

  if (layout === "list") {
    return (
      <div className="flex gap-6 py-6">
        <Link
          href={`/products/${product.slug}`}
          className="group relative w-28 aspect-3/4 bg-muted overflow-hidden shrink-0"
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-transform duration-700 group-hover:scale-105",
              isSoldOut && "opacity-50"
            )}
            sizes="112px"
          />
          {isSoldOut && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/60 font-sans text-xs tracking-[0.15em] uppercase text-foreground">
              Sold Out
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <Link href={`/products/${product.slug}`}>
              <p className="font-sans text-sm font-medium tracking-wide text-foreground mb-2 hover:text-muted-foreground transition-colors">
                {product.name}
              </p>
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-sans text-sm text-foreground">
                LE {Number(product.priceAfterDiscount).toLocaleString()}
              </p>
              {hasDiscount && (
                <p className="font-sans text-xs text-muted-foreground line-through">
                  LE {Number(product.price).toLocaleString()}
                </p>
              )}
              {hasDiscount && (
                <span className="font-sans text-xs text-gold">
                  -{product.discount}%
                </span>
              )}
            </div>
            {product.ratingsAverage && (
              <div className="flex items-center gap-1">
                <LucideStar className="size-3 fill-gold text-gold" />
                <span className="font-sans text-xs text-muted-foreground">
                  {Number(product.ratingsAverage).toFixed(1)}
                  {product.ratingsQuantity > 0 && ` (${product.ratingsQuantity})`}
                </span>
              </div>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-fit mt-3 text-[0.6875rem] tracking-[0.15em] uppercase hover:bg-gold transition-colors duration-300"
            disabled={isSoldOut}
          >
            {isSoldOut ? "Sold Out" : "Add to Cart"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="relative aspect-3/4 bg-muted overflow-hidden mb-4">
        <Link href={`/products/${product.slug}`} className="block size-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-transform duration-700 group-hover:scale-105",
              isSoldOut && "opacity-50"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
          {isSoldOut && (
            <div className="absolute inset-0 bg-background/40" />
          )}
        </Link>

        {badge && (
          <span className="absolute top-3 left-3 bg-gold text-gold-foreground font-sans text-[0.625rem] px-2 py-1 tracking-widest uppercase z-10">
            {badge === "sale" ? "Sale" : "New"}
          </span>
        )}

        {isSoldOut && (
          <span className="absolute top-3 left-3 bg-foreground/80 text-background font-sans text-[0.625rem] px-2 py-1 tracking-widest uppercase z-10">
            Sold Out
          </span>
        )}

        <button
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center bg-background/90 hover:bg-background transition-colors"
        >
          <LucideHeart
            className={cn(
              "size-4 transition-colors",
              inWishlist ? "fill-foreground text-foreground" : "text-foreground"
            )}
          />
        </button>
      </div>

      <Link href={`/products/${product.slug}`}>
        <p className={cn(
          "font-sans text-sm font-medium tracking-wide mb-1 transition-colors",
          isSoldOut ? "text-muted-foreground" : "text-foreground hover:text-muted-foreground"
        )}>
          {product.name}
        </p>
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <p className={cn(
          "font-sans text-sm",
          isSoldOut ? "text-muted-foreground" : "text-foreground"
        )}>
          LE {Number(product.priceAfterDiscount).toLocaleString()}
        </p>
        {hasDiscount && (
          <p className="font-sans text-xs text-muted-foreground line-through">
            LE {Number(product.price).toLocaleString()}
          </p>
        )}
      </div>

      {product.ratingsAverage && (
        <div className="flex items-center gap-1 mb-3">
          <LucideStar className="size-3 fill-gold text-gold" />
          <span className="font-sans text-xs text-muted-foreground">
            {Number(product.ratingsAverage).toFixed(1)}
            {product.ratingsQuantity > 0 && ` (${product.ratingsQuantity})`}
          </span>
        </div>
      )}

      <Button
        variant="default"
        className={cn(
          "w-full text-[0.6875rem] tracking-[0.15em] uppercase py-2.5 hover:bg-gold transition-colors duration-300",
          !product.ratingsAverage && "mt-3"
        )}
        disabled={isSoldOut}
      >
        {isSoldOut ? "Sold Out" : "Add to Cart"}
      </Button>
    </div>
  );
}
