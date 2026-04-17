import { ordersSearchParamsCache } from "./hooks/use-orders-params";
import { getOrders } from "./services/get-orders";
import { OrdersToolbar } from "./components/orders-toolbar";
import { OrdersTable } from "./components/orders-table";

type AdminOrdersFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function AdminOrdersFeature({ searchParams }: AdminOrdersFeatureProps) {
  const params = await ordersSearchParamsCache.parse(searchParams);
  const { orders, total, pageCount } = await getOrders(params);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track all customer orders
        </p>
      </div>
      <OrdersToolbar total={total} />
      <OrdersTable orders={orders} pageCount={pageCount} />
    </div>
  );
}
