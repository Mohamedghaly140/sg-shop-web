import { ProductStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type {
  DateRangeParams,
  ProductsAnalytics,
  TopProduct,
  CategoryRevenue,
} from "../types";
import { resolveDateRange } from "../utils/resolve-date-range";

export async function getProductsAnalytics({
  from,
  to,
}: DateRangeParams): Promise<ProductsAnalytics> {
  const { start, end } = resolveDateRange(from, to);

  const [unitsSoldAgg, activeCount, outOfStockCount, topProducts, revenueByCategory] =
    await Promise.all([
      prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: { order: { createdAt: { gte: start, lte: end } } },
      }),
      prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      prisma.product.count({
        where: { quantity: 0, status: ProductStatus.ACTIVE },
      }),
      prisma.$queryRaw<TopProduct[]>`
        SELECT
          p.id,
          p.name,
          c.name AS "categoryName",
          CAST(COALESCE(SUM(oi.quantity), 0) AS INTEGER) AS sold,
          COALESCE(SUM(oi.quantity * oi.price), 0)::float8 AS revenue
        FROM products p
        JOIN categories c ON p."categoryId" = c.id
        LEFT JOIN "orderItems" oi ON oi."productId" = p.id
        LEFT JOIN orders o ON oi."orderId" = o.id
          AND o."createdAt" >= ${start}
          AND o."createdAt" <= ${end}
        GROUP BY p.id, p.name, "categoryName"
        ORDER BY sold DESC
        LIMIT 10
      `,
      prisma.$queryRaw<CategoryRevenue[]>`
        SELECT
          c.name,
          COALESCE(SUM(oi.quantity * oi.price), 0)::float8 AS revenue
        FROM categories c
        LEFT JOIN products p ON p."categoryId" = c.id
        LEFT JOIN "orderItems" oi ON oi."productId" = p.id
        LEFT JOIN orders o ON oi."orderId" = o.id
          AND o."createdAt" >= ${start}
          AND o."createdAt" <= ${end}
        GROUP BY c.name
        ORDER BY revenue DESC
      `,
    ]);

  return {
    totalUnitsSold: Number(unitsSoldAgg._sum.quantity ?? 0),
    activeProductsCount: activeCount,
    outOfStockCount,
    topProducts,
    revenueByCategory,
  };
}
