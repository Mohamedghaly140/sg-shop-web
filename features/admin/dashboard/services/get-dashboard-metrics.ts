import { format, startOfMonth, subMonths } from "date-fns";

import { OrderStatus, ProductStatus, Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { DashboardMetrics } from "../types";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));

  const [
    currentRevenueAgg,
    previousRevenueAgg,
    currentOrdersCount,
    previousOrdersCount,
    currentCustomersCount,
    previousCustomersCount,
    pendingOrdersCount,
    lowStockCount,
    activeCouponsRaw,
    ordersByStatusRaw,
    revenueByDayRaw,
    recentOrdersRaw,
    topProductsRaw,
    lowStockProductsRaw,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalOrderPrice: true },
      where: {
        createdAt: { gte: currentMonthStart },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      },
    }),
    prisma.order.aggregate({
      _sum: { totalOrderPrice: true },
      where: {
        createdAt: { gte: previousMonthStart, lt: currentMonthStart },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      },
    }),
    prisma.order.count({ where: { createdAt: { gte: currentMonthStart } } }),
    prisma.order.count({
      where: { createdAt: { gte: previousMonthStart, lt: currentMonthStart } },
    }),
    prisma.user.count({
      where: { role: Role.USER, createdAt: { gte: currentMonthStart } },
    }),
    prisma.user.count({
      where: {
        role: Role.USER,
        createdAt: { gte: previousMonthStart, lt: currentMonthStart },
      },
    }),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.product.count({
      where: { quantity: { lt: 10 }, status: ProductStatus.ACTIVE },
    }),
    prisma.$queryRaw<[{ count: number }]>`
      SELECT CAST(COUNT(*) AS INTEGER) AS count
      FROM coupons
      WHERE expire > NOW()
        AND ("maxUsage" = 0 OR "usedCount" < "maxUsage")
    `,
    prisma.$queryRaw<{ status: string; count: number }[]>`
      SELECT status::text, CAST(COUNT(*) AS INTEGER) AS count
      FROM orders
      GROUP BY status
    `,
    prisma.$queryRaw<{ date: Date; revenue: number }[]>`
      SELECT
        DATE_TRUNC('day', "createdAt") AS date,
        COALESCE(SUM("totalOrderPrice"), 0)::float8 AS revenue
      FROM orders
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        AND status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `,
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        humanOrderId: true,
        status: true,
        paymentMethod: true,
        totalOrderPrice: true,
        createdAt: true,
        user: { select: { name: true } },
        anonName: true,
      },
    }),
    prisma.$queryRaw<
      {
        id: string;
        name: string;
        imageUrl: string;
        categoryName: string;
        revenue: number;
        units: number;
      }[]
    >`
      SELECT
        p.id,
        p.name,
        p."imageUrl",
        c.name AS "categoryName",
        COALESCE(SUM(oi.quantity * oi.price), 0)::float8 AS revenue,
        CAST(COALESCE(SUM(oi.quantity), 0) AS INTEGER) AS units
      FROM products p
      LEFT JOIN "orderItems" oi ON oi."productId" = p.id
      JOIN categories c ON p."categoryId" = c.id
      GROUP BY p.id, p.name, p."imageUrl", "categoryName"
      ORDER BY COALESCE(SUM(oi.quantity * oi.price), 0) DESC
      LIMIT 5
    `,
    prisma.product.findMany({
      where: { quantity: { lt: 10 }, status: ProductStatus.ACTIVE },
      select: {
        id: true,
        name: true,
        quantity: true,
        status: true,
        category: { select: { name: true } },
      },
      orderBy: { quantity: "asc" },
      take: 20,
    }),
  ]);

  const currentRevenue = Number(currentRevenueAgg._sum.totalOrderPrice ?? 0);
  const previousRevenue = Number(previousRevenueAgg._sum.totalOrderPrice ?? 0);

  return {
    revenue: { current: currentRevenue, previous: previousRevenue },
    orders: { current: currentOrdersCount, previous: previousOrdersCount },
    newCustomers: {
      current: currentCustomersCount,
      previous: previousCustomersCount,
    },
    avgOrderValue: {
      current:
        currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0,
      previous:
        previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0,
    },
    pendingOrders: pendingOrdersCount,
    lowStockCount,
    activeCoupons: activeCouponsRaw[0]?.count ?? 0,
    ordersByStatus: ordersByStatusRaw,
    revenueByDay: revenueByDayRaw.map((row) => ({
      date: format(row.date, "MMM d"),
      revenue: row.revenue,
    })),
    recentOrders: recentOrdersRaw.map((o) => ({
      id: o.id,
      humanOrderId: o.humanOrderId,
      customerName: o.user?.name ?? o.anonName ?? "Guest",
      status: o.status,
      paymentMethod: o.paymentMethod,
      totalOrderPrice: o.totalOrderPrice ? Number(o.totalOrderPrice) : null,
      createdAt: o.createdAt,
    })),
    topProducts: topProductsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      categoryName: p.categoryName,
      revenue: p.revenue,
      units: p.units,
    })),
    lowStockProducts: lowStockProductsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      categoryName: p.category.name,
      status: p.status,
    })),
  };
}
