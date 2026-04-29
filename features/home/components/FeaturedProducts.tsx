import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "./SectionHeader";
import type { getFeaturedProducts } from "../services/get-home-data";

type FeaturedProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

type FeaturedProductsProps = {
  products: FeaturedProduct[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-border">
      <SectionHeader title="Featured" href="/products?featured=true" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((product) => {
          const hasDiscount = Number(product.discount) > 0;
          return (
            <div key={product.id} className="group">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
                </div>
                <p className="font-sans text-sm font-medium text-foreground tracking-wide mb-1">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <p className="font-sans text-sm text-foreground">
                    LE {Number(product.priceAfterDiscount).toLocaleString()}
                  </p>
                  {hasDiscount && (
                    <p className="font-sans text-xs text-muted-foreground line-through">
                      LE {Number(product.price).toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
              {/* Add to Cart — wired in Plan 3 (Cart & CartDrawer) */}
              <button
                type="button"
                className="w-full font-sans text-[0.6875rem] tracking-[0.15em] uppercase bg-foreground text-background py-2.5 hover:bg-gold transition-colors duration-300"
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
