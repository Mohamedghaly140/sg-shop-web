import { getRelatedProducts } from "../services/get-related-products";
import { ProductCard } from "@/features/products/components/product-card";

type RelatedProductsSectionProps = {
  productId: string;
};

export async function RelatedProductsSection({
  productId,
}: RelatedProductsSectionProps) {
  const products = await getRelatedProducts(productId);

  if (products.length === 0) return null;

  return (
    <section aria-label="You may also like" className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <h2 className="font-heading text-2xl mb-8 md:mb-10">
          You May Also Like
        </h2>
        <div
          className="
            flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory
            lg:grid lg:grid-cols-4 lg:gap-x-4 lg:gap-y-10 lg:overflow-visible
          "
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[calc(50vw-2rem)] shrink-0 snap-start lg:w-auto"
            >
              <ProductCard product={product} layout="grid" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
