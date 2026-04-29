import { ProductCard } from "./ProductCard";
import type { StorefrontProductItem } from "../types";

type ProductListProps = {
  products: StorefrontProductItem[];
};

export function ProductList({ products }: ProductListProps) {
  return (
    <div className="divide-y divide-border">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} layout="list" />
      ))}
    </div>
  );
}
