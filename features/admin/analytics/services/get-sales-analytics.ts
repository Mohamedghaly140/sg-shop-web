import {
  differenceInDays,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { DateRangeParams, SalesAnalytics } from "../types";

function resolveDateRange(from: string | null, to: string | null) {
  const end = to ? parseISO(to) : new Date();
  const start = from ? parseISO(from) : subDays(end, 30);
  return { start: startOfDay(start), end: endOfDay(end) };
}

function getGroupingInterval(
  start: Date,
  end: Date,
): "day" | "week" | "month" {
  const days = differenceInDays(end, start);
  if (days <= 60) return "day";
  if (days <= 180) return "week";
  return "month";
}

function formatBucketLabel(
  date: Date,
  interval: "day" | "week" | "month",
): string {
  if (interval === "month") return format(date, "MMM yyyy");
  return format(date, "MMM d");
}

export async function getSalesAnalytics({
  from,
  to,
}: DateRangeParams): Promise<SalesAnalytics> {
  const { start, end } = resolveDateRange(from, to);
  const interval = getGroupingInterval(start, end);

  const [revenueAgg, discountAgg, totalOrders, ordersByStatusRaw, paymentRaw, revenueOverTimeRaw] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { totalOrderPrice: true },
        where: {
          createdAt: { gte: start, lte: end },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
      }),
      prisma.order.aggregate({
        _sum: { discountApplied: true },
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.order.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.$queryRaw<{ status: string; count: number }[]>`
        SELECT status::text, CAST(COUNT(*) AS INTEGER) AS count
        FROM orders
        WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
        GROUP BY status
      `,
      prisma.$queryRaw<{ method: string; count: number }[]>`
        SELECT "paymentMethod"::text AS method, CAST(COUNT(*) AS INTEGER) AS count
        FROM orders
        WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
        GROUP BY "paymentMethod"
      `,
      prisma.$queryRaw<{ bucket: Date; revenue: number }[]>`
        SELECT
          DATE_TRUNC(${Prisma.raw(`'${interval}'`)}, "createdAt") AS bucket,
          COALESCE(SUM("totalOrderPrice"), 0)::float8 AS revenue
        FROM orders
        WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
          AND status NOT IN ('CANCELLED','REFUNDED')
        GROUP BY bucket
        ORDER BY bucket ASC
      `,
    ]);

  const totalRevenue = Number(revenueAgg._sum.totalOrderPrice ?? 0);
  const totalDiscountApplied = Number(discountAgg._sum.discountApplied ?? 0);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    totalDiscountApplied,
    grouping: interval,
    revenueOverTime: revenueOverTimeRaw.map((row) => ({
      label: formatBucketLabel(row.bucket, interval),
      revenue: row.revenue,
    })),
    ordersByStatus: ordersByStatusRaw,
    paymentMethodSplit: paymentRaw,
  };
}
