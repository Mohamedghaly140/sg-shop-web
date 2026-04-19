import type { LucideIcon } from "lucide-react";

export type AnalyticsTab = "sales" | "products" | "customers" | "coupons" | "geography";
export type DateRangeParams = { from: string | null; to: string | null };

export type { LucideIcon };

// Sales
export type SalesAnalytics = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalDiscountApplied: number;
  revenueOverTime: { label: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  paymentMethodSplit: { method: string; count: number }[];
  grouping: "day" | "week" | "month";
};

// Products
export type TopProduct = {
  id: string;
  name: string;
  categoryName: string;
  brandName: string | null;
  sold: number;
  revenue: number;
};
export type CategoryRevenue = { name: string; revenue: number };
export type BrandRevenue = { name: string; revenue: number };
export type ProductsAnalytics = {
  totalUnitsSold: number;
  activeProductsCount: number;
  outOfStockCount: number;
  topProducts: TopProduct[];
  revenueByCategory: CategoryRevenue[];
  revenueByBrand: BrandRevenue[];
};

// Customers
export type TopSpender = {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
};
export type NewCustomerPoint = { label: string; count: number };
export type CustomersAnalytics = {
  totalCustomers: number;
  newThisPeriod: number;
  activeThisPeriod: number;
  newCustomersOverTime: NewCustomerPoint[];
  topSpenders: TopSpender[];
};

// Coupons
export type CouponRow = {
  id: string;
  name: string;
  discountPct: number;
  usedCount: number;
  maxUsage: number;
  totalDiscountGiven: number;
  periodRedemptions: number;
  expire: Date;
};
export type CouponsAnalytics = {
  totalCoupons: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
  coupons: CouponRow[];
};

// Geography
export type GovernorateRow = { governorate: string; orderCount: number; revenue: number };
export type GeographyAnalytics = { rows: GovernorateRow[] };
