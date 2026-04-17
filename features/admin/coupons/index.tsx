import { couponsSearchParamsCache } from "./hooks/use-coupons-params";
import { getCoupons } from "./services/get-coupons";
import { CouponsToolbar } from "./components/coupons-toolbar";
import { CouponsTable } from "./components/coupons-table";

type AdminCouponsFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function AdminCouponsFeature({
  searchParams,
}: AdminCouponsFeatureProps) {
  const params = await couponsSearchParamsCache.parse(searchParams);
  const { coupons, total, pageCount } = await getCoupons(params);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          Manage discount codes and promotions
        </p>
      </div>
      <CouponsToolbar total={total} />
      <CouponsTable coupons={coupons} pageCount={pageCount} />
    </div>
  );
}
