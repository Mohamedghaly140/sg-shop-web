import { brandsSearchParamsCache } from "./hooks/use-brands-params";
import { getBrands } from "./services/get-brands";
import { BrandsToolbar } from "./components/brands-toolbar";
import { BrandsTable } from "./components/brands-table";

type AdminBrandsFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function AdminBrandsFeature({ searchParams }: AdminBrandsFeatureProps) {
  const params = await brandsSearchParamsCache.parse(searchParams);
  const { brands, total, pageCount } = await getBrands(params);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Brands</h1>
        <p className="text-sm text-muted-foreground">
          Manage product brands, slugs, and logos
        </p>
      </div>
      <BrandsToolbar total={total} />
      <BrandsTable brands={brands} pageCount={pageCount} />
    </div>
  );
}
