import { AlertTriangle, Banknote, Clock, ShoppingCart, Tag, TrendingUp, Users } from "lucide-react";

import { AlertCard } from "./components/alert-card";
import { LowStockAlerts } from "./components/low-stock-alerts";
import { OrdersByStatusChart } from "./components/orders-by-status-chart";
import { RecentOrdersTable } from "./components/recent-orders-table";
import { RevenueChart } from "./components/revenue-chart";
import { StatCard } from "./components/stat-card";
import { TopProductsTable } from "./components/top-products-table";
import { getDashboardMetrics } from "./services/get-dashboard-metrics";

function fmt(value: number) {
  return `EGP ${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default async function AdminDashboardFeature() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store&apos;s performance this month
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue This Month"
          value={fmt(metrics.revenue.current)}
          current={metrics.revenue.current}
          previous={metrics.revenue.previous}
          icon={Banknote}
        />
        <StatCard
          label="Orders This Month"
          value={metrics.orders.current.toLocaleString()}
          current={metrics.orders.current}
          previous={metrics.orders.previous}
          icon={ShoppingCart}
        />
        <StatCard
          label="New Customers"
          value={metrics.newCustomers.current.toLocaleString()}
          current={metrics.newCustomers.current}
          previous={metrics.newCustomers.previous}
          icon={Users}
        />
        <StatCard
          label="Avg Order Value"
          value={fmt(metrics.avgOrderValue.current)}
          current={metrics.avgOrderValue.current}
          previous={metrics.avgOrderValue.previous}
          icon={TrendingUp}
        />
      </div>

      {/* Action Alert Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AlertCard
          label="Pending Orders"
          value={metrics.pendingOrders}
          description="Awaiting confirmation"
          icon={Clock}
          href="/admin/orders?status=PENDING"
          variant="warning"
        />
        <AlertCard
          label="Low Stock Products"
          value={metrics.lowStockCount}
          description="Active products below 10 units"
          icon={AlertTriangle}
          href="/admin/products?lowStock=true"
          variant="danger"
        />
        <AlertCard
          label="Active Coupons"
          value={metrics.activeCoupons}
          description="Currently valid"
          icon={Tag}
          href="/admin/coupons"
          variant="info"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueChart data={metrics.revenueByDay} />
        <OrdersByStatusChart data={metrics.ordersByStatus} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentOrdersTable orders={metrics.recentOrders} />
        <TopProductsTable products={metrics.topProducts} />
      </div>

      {/* Low Stock Alerts */}
      {metrics.lowStockProducts.length > 0 && (
        <LowStockAlerts products={metrics.lowStockProducts} />
      )}
    </div>
  );
}
