import { Suspense } from "react";
import { TabsContent } from "@/components/ui/tabs";

import { AnalyticsHeader } from "./components/analytics-header";
import { AnalyticsTabSkeleton } from "./components/analytics-tab-skeleton";
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
import type { DateRangeParams } from "./types";

type AdminAnalyticsFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

async function SalesTabLoader({ from, to }: DateRangeParams) {
  const data = await getSalesAnalytics({ from, to });
  return <SalesTab data={data} />;
}

async function ProductsTabLoader({ from, to }: DateRangeParams) {
  const data = await getProductsAnalytics({ from, to });
  return <ProductsTab data={data} />;
}

async function CustomersTabLoader({ from, to }: DateRangeParams) {
  const data = await getCustomersAnalytics({ from, to });
  return <CustomersTab data={data} />;
}

async function CouponsTabLoader({ from, to }: DateRangeParams) {
  const data = await getCouponsAnalytics({ from, to });
  return <CouponsTab data={data} />;
}

async function GeographyTabLoader({ from, to }: DateRangeParams) {
  const data = await getGeographyAnalytics({ from, to });
  return <GeographyTab data={data} />;
}

export default async function AdminAnalyticsFeature({
  searchParams,
}: AdminAnalyticsFeatureProps) {
  const { tab, from, to } = await analyticsParamsCache.parse(searchParams);
  const range: DateRangeParams = { from, to };

  return (
    <div className="space-y-6 p-6">
      <AnalyticsHeader />
      <AnalyticsTabs>
        <TabsContent value="sales">
          <Suspense fallback={<AnalyticsTabSkeleton />}>
            {tab === "sales" && <SalesTabLoader {...range} />}
          </Suspense>
        </TabsContent>
        <TabsContent value="products">
          <Suspense fallback={<AnalyticsTabSkeleton />}>
            {tab === "products" && <ProductsTabLoader {...range} />}
          </Suspense>
        </TabsContent>
        <TabsContent value="customers">
          <Suspense fallback={<AnalyticsTabSkeleton />}>
            {tab === "customers" && <CustomersTabLoader {...range} />}
          </Suspense>
        </TabsContent>
        <TabsContent value="coupons">
          <Suspense fallback={<AnalyticsTabSkeleton />}>
            {tab === "coupons" && <CouponsTabLoader {...range} />}
          </Suspense>
        </TabsContent>
        <TabsContent value="geography">
          <Suspense fallback={<AnalyticsTabSkeleton />}>
            {tab === "geography" && <GeographyTabLoader {...range} />}
          </Suspense>
        </TabsContent>
      </AnalyticsTabs>
    </div>
  );
}
