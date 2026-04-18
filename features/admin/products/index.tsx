import { productsSearchParamsCache } from "./hooks/use-products-params";
import { getProducts } from "./services/get-products";
import { getProductFilterOptions } from "./services/get-product-filter-options";
import { ProductsToolbar } from "./components/products-toolbar";
import { ProductsTable } from "./components/products-table";

type AdminProductsFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function AdminProductsFeature({
  searchParams,
}: AdminProductsFeatureProps) {
  const params = await productsSearchParamsCache.parse(searchParams);
  const [{ products, total, pageCount }, filterOptions] = await Promise.all([
    getProducts(params),
    getProductFilterOptions(),
  ]);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, and manage your catalog — pricing, stock, images, and status
        </p>
      </div>
      <ProductsToolbar total={total} options={filterOptions} />
      <ProductsTable products={products} pageCount={pageCount} />
    </div>
  );
}
