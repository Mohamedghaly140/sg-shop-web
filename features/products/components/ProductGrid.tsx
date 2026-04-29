import { ProductCard } from "./ProductCard";
import type { StorefrontProductItem } from "../types";

type ProductGridProps = {
  products: StorefrontProductItem[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} layout="grid" />
      ))}
    </div>
  );
}
