import Link from "next/link";

import { loadProductParams } from "./hooks/useProductParams";
import { getProducts } from "./services/get-products";
import { getFilterOptions } from "./services/get-filter-options";
import { ProductGrid } from "./components/ProductGrid";
import { ProductList } from "./components/ProductList";
import { ProductFilterBar } from "./components/ProductFilterBar";
import { MobileFiltersSheet } from "./components/MobileFiltersSheet";
import { ProductSort } from "./components/ProductSort";
import { ProductPagination } from "./components/ProductPagination";
import { ProductEmptyState } from "./components/ProductEmptyState";

type ProductsFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function ProductsFeature({
  searchParams,
}: ProductsFeatureProps) {
  const params = await loadProductParams.parse(searchParams);

  const [{ products, total, pageCount }, filterOptions] = await Promise.all([
    getProducts(params),
    getFilterOptions(),
  ]);

  const activeFilterCount = [
    params.category,
    params.brand,
    params.size,
    params.color,
    params.minPrice > 0 ? "x" : null,
    params.maxPrice > 0 ? "x" : null,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="px-4 md:px-8 pt-8 pb-6">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground">Products</li>
          </ol>
        </nav>
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-3xl">Collection</h2>
          <p className="font-sans text-xs text-muted-foreground tracking-wide">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      {/* Sticky filter bar — desktop only */}
      <ProductFilterBar options={filterOptions} />

      {/* Sort / mobile filters bar */}
      <div className="px-4 md:px-8 py-4 flex items-center justify-between border-b border-border lg:border-none">
        <MobileFiltersSheet
          options={filterOptions}
          activeCount={activeFilterCount}
        />
        <ProductSort />
      </div>

      {/* Product grid or list */}
      <div className="px-4 md:px-8 py-6">
        {products.length === 0 ? (
          <ProductEmptyState />
        ) : params.view === "list" ? (
          <ProductList products={products} />
        ) : (
          <ProductGrid products={products} />
        )}

        <ProductPagination page={params.page} pageCount={pageCount} />
      </div>
    </div>
  );
}
