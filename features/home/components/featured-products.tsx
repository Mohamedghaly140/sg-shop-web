import { SectionHeader } from "./section-header";
import { ProductCard } from "@/features/products/components/product-card";
import type { StorefrontProductItem } from "@/features/products/types";

type FeaturedProductsProps = {
  products: StorefrontProductItem[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-border">
      <SectionHeader title="Featured" href="/products?featured=true" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} layout="grid" />
        ))}
      </div>
    </section>
  );
}
