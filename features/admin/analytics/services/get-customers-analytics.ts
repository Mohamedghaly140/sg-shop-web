import {
  differenceInDays,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

import { OrderStatus, Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { CustomersAnalytics, DateRangeParams, TopSpender } from "../types";

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

export async function getCustomersAnalytics({
  from,
  to,
}: DateRangeParams): Promise<CustomersAnalytics> {
  const { start, end } = resolveDateRange(from, to);
  const interval = getGroupingInterval(start, end);

  const [totalCustomers, newThisPeriod, activeThisPeriod, newOverTimeRaw, topSpenders] =
    await Promise.all([
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.user.count({
        where: { role: Role.USER, createdAt: { gte: start, lte: end } },
      }),
      prisma.user.count({
        where: {
          role: Role.USER,
          orders: { some: { createdAt: { gte: start, lte: end } } },
        },
      }),
      prisma.$queryRawUnsafe<{ bucket: Date; count: number }[]>(
        `SELECT
          DATE_TRUNC('${interval}', "createdAt") AS bucket,
          CAST(COUNT(*) AS INTEGER) AS count
        FROM users
        WHERE role = 'USER'
          AND "createdAt" >= $1
          AND "createdAt" <= $2
        GROUP BY bucket
        ORDER BY bucket ASC`,
        start,
        end,
      ),
      prisma.$queryRaw<TopSpender[]>`
        SELECT
          u.id,
          u.name,
          u.email,
          CAST(COUNT(DISTINCT o.id) AS INTEGER) AS "ordersCount",
          COALESCE(SUM(o."totalOrderPrice"), 0)::float8 AS "totalSpent"
        FROM users u
        JOIN orders o ON o."userId" = u.id
        WHERE o."createdAt" >= ${start}
          AND o."createdAt" <= ${end}
          AND o.status NOT IN (${OrderStatus.CANCELLED}, ${OrderStatus.REFUNDED})
        GROUP BY u.id, u.name, u.email
        ORDER BY "totalSpent" DESC
        LIMIT 10
      `,
    ]);

  return {
    totalCustomers,
    newThisPeriod,
    activeThisPeriod,
    newCustomersOverTime: newOverTimeRaw.map((row) => ({
      label: formatBucketLabel(row.bucket, interval),
      count: row.count,
    })),
    topSpenders,
  };
}
