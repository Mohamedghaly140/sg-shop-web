import { TabsContent } from "@/components/ui/tabs";

import { AnalyticsHeader } from "./components/analytics-header";
import { AnalyticsTabs } from "./components/analytics-tabs";
import { CustomersTab } from "./components/customers/customers-tab";
import { CouponsTab } from "./components/coupons/coupons-tab";
import { GeographyTab } from "./components/geography/geography-tab";
import { ProductsTab } from "./components/products/products-tab";
import { SalesTab } from "./components/sales/sales-tab";
import { analyticsParamsCache } from "./hooks/use-analytics-params";
import { getCouponsAnalytics } from "./services/get-coupons-analytics";
import { getCustomersAnalytics } from "./services/get-customers-analytics";
import { getGeographyAnalytics } from "./services/get-geography-analytics";
import { getProductsAnalytics } from "./services/get-products-analytics";
import { getSalesAnalytics } from "./services/get-sales-analytics";

type AdminAnalyticsFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function AdminAnalyticsFeature({
  searchParams,
}: AdminAnalyticsFeatureProps) {
  const { tab, from, to } = await analyticsParamsCache.parse(searchParams);

  const salesData =
    tab === "sales" ? await getSalesAnalytics({ from, to }) : null;
  const productsData =
    tab === "products" ? await getProductsAnalytics({ from, to }) : null;
  const customersData =
    tab === "customers" ? await getCustomersAnalytics({ from, to }) : null;
  const couponsData =
    tab === "coupons" ? await getCouponsAnalytics({ from, to }) : null;
  const geographyData =
    tab === "geography" ? await getGeographyAnalytics({ from, to }) : null;

  return (
    <div className="space-y-6 p-6">
      <AnalyticsHeader />
      <AnalyticsTabs>
        <TabsContent value="sales">
          {salesData && <SalesTab data={salesData} />}
        </TabsContent>
        <TabsContent value="products">
          {productsData && <ProductsTab data={productsData} />}
        </TabsContent>
        <TabsContent value="customers">
          {customersData && <CustomersTab data={customersData} />}
        </TabsContent>
        <TabsContent value="coupons">
          {couponsData && <CouponsTab data={couponsData} />}
        </TabsContent>
        <TabsContent value="geography">
          {geographyData && <GeographyTab data={geographyData} />}
        </TabsContent>
      </AnalyticsTabs>
    </div>
  );
}
