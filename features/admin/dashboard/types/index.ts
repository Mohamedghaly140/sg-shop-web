export type DashboardMetrics = {
  revenue: { current: number; previous: number };
  orders: { current: number; previous: number };
  newCustomers: { current: number; previous: number };
  avgOrderValue: { current: number; previous: number };
  pendingOrders: number;
  lowStockCount: number;
  activeCoupons: number;
  ordersByStatus: { status: string; count: number }[];
  revenueByDay: { date: string; revenue: number }[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
};

export type RecentOrder = {
  id: string;
  humanOrderId: string;
  customerName: string;
  status: string;
  paymentMethod: string;
  totalOrderPrice: number | null;
  createdAt: Date;
};

export type TopProduct = {
  id: string;
  name: string;
  imageUrl: string;
  categoryName: string;
  revenue: number;
  units: number;
};

export type LowStockProduct = {
  id: string;
  name: string;
  quantity: number;
  categoryName: string;
  status: string;
};
