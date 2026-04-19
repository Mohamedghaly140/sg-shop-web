import { endOfDay, parseISO, startOfDay, subDays } from "date-fns";

import { prisma } from "@/lib/prisma";

import type { CouponRow, CouponsAnalytics, DateRangeParams } from "../types";

function resolveDateRange(from: string | null, to: string | null) {
  const end = to ? parseISO(to) : new Date();
  const start = from ? parseISO(from) : subDays(end, 30);
  return { start: startOfDay(start), end: endOfDay(end) };
}

export async function getCouponsAnalytics({
  from,
  to,
}: DateRangeParams): Promise<CouponsAnalytics> {
  const { start, end } = resolveDateRange(from, to);

  const [totalCoupons, periodStats, coupons] = await Promise.all([
    prisma.coupon.count(),
    prisma.$queryRaw<{ totalRedemptions: number; totalDiscountGiven: number }[]>`
      SELECT
        CAST(COUNT(o.id) AS INTEGER) AS "totalRedemptions",
        COALESCE(SUM(o."discountApplied"), 0)::float8 AS "totalDiscountGiven"
      FROM orders o
      WHERE o."couponId" IS NOT NULL
        AND o."createdAt" >= ${start}
        AND o."createdAt" <= ${end}
    `,
    prisma.$queryRaw<CouponRow[]>`
      SELECT
        c.id,
        c.name,
        c.discount::float8 AS "discountPct",
        c."usedCount",
        c."maxUsage",
        c.expire,
        CAST(COUNT(o.id) AS INTEGER) AS "periodRedemptions",
        COALESCE(SUM(o."discountApplied"), 0)::float8 AS "totalDiscountGiven"
      FROM coupons c
      LEFT JOIN orders o ON o."couponId" = c.id
        AND o."createdAt" >= ${start}
        AND o."createdAt" <= ${end}
      GROUP BY c.id, c.name, c.discount, c."usedCount", c."maxUsage", c.expire
      ORDER BY "totalDiscountGiven" DESC
    `,
  ]);

  return {
    totalCoupons,
    totalRedemptions: periodStats[0]?.totalRedemptions ?? 0,
    totalDiscountGiven: periodStats[0]?.totalDiscountGiven ?? 0,
    coupons,
  };
}
