import { categoriesSearchParamsCache } from "./hooks/use-categories-params";
import { getCategories } from "./services/get-categories";
import { CategoriesToolbar } from "./components/categories-toolbar";
import { CategoriesTable } from "./components/categories-table";

type AdminCategoriesFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function AdminCategoriesFeature({ searchParams }: AdminCategoriesFeatureProps) {
  const params = await categoriesSearchParamsCache.parse(searchParams);
  const { categories, total, pageCount } = await getCategories(params);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Manage product categories and subcategories
        </p>
      </div>
      <CategoriesToolbar total={total} />
      <CategoriesTable categories={categories} pageCount={pageCount} />
    </div>
  );
}
