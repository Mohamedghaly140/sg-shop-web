import { prisma } from "@/lib/prisma";

import type { DateRangeParams, GeographyAnalytics, GovernorateRow } from "../types";
import { resolveDateRange } from "../utils/resolve-date-range";

export async function getGeographyAnalytics({
  from,
  to,
}: DateRangeParams): Promise<GeographyAnalytics> {
  const { start, end } = resolveDateRange(from, to);

  const rows = await prisma.$queryRaw<GovernorateRow[]>`
    SELECT
      COALESCE(a.governorate, o."anonGovernorate") AS governorate,
      CAST(COUNT(o.id) AS INTEGER) AS "orderCount",
      COALESCE(SUM(o."totalOrderPrice"), 0)::float8 AS revenue
    FROM orders o
    LEFT JOIN addresses a ON o."shippingAddressId" = a.id
    WHERE o."createdAt" >= ${start}
      AND o."createdAt" <= ${end}
      AND COALESCE(a.governorate, o."anonGovernorate") IS NOT NULL
    GROUP BY COALESCE(a.governorate, o."anonGovernorate")
    ORDER BY "orderCount" DESC
  `;

  return { rows };
}
