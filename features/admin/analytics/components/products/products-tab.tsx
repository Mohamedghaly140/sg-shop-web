import {
  LucideBoxes,
  LucidePackageX,
  LucideShoppingBag,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import type { ProductsAnalytics } from "../../types";
import { AnalyticsKpiCard } from "../analytics-kpi-card";
import { BrandChart } from "./brand-chart";
import { CategoryChart } from "./category-chart";
import { TopProductsTable } from "./top-products-table";

type ProductsTabProps = { data: ProductsAnalytics };

export function ProductsTab({ data }: ProductsTabProps) {
  return (
    <TabsContent value="products" className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <AnalyticsKpiCard
          label="Units Sold"
          value={data.totalUnitsSold.toLocaleString("en-US")}
          icon={LucideShoppingBag}
          description="In selected period"
        />
        <AnalyticsKpiCard
          label="Active Products"
          value={data.activeProductsCount.toLocaleString("en-US")}
          icon={LucideBoxes}
        />
        <AnalyticsKpiCard
          label="Out of Stock"
          value={data.outOfStockCount.toLocaleString("en-US")}
          icon={LucidePackageX}
          description="Active products with 0 qty"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans font-semibold">Top 10 Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TopProductsTable data={data.topProducts} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryChart data={data.revenueByCategory} />
        <BrandChart data={data.revenueByBrand} />
      </div>
    </TabsContent>
  );
}
