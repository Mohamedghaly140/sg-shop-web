import type { Coupon } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type GetCouponsParams = {
  page: number;
  limit: number;
  search: string;
  status: "active" | "expired" | "exhausted" | null;
};

export type CouponRow = Pick<
  Coupon,
  "id" | "name" | "discount" | "usedCount" | "maxUsage" | "expire" | "createdAt"
>;

type GetCouponsResult = {
  coupons: CouponRow[];
  total: number;
  pageCount: number;
};

type RawCouponRow = {
  id: string;
  name: string;
  discount: string;
  usedCount: number;
  maxUsage: number;
  expire: Date;
  createdAt: Date;
};

function mapRawRow(row: RawCouponRow): CouponRow {
  return {
    id: row.id,
    name: row.name,
    discount: new Prisma.Decimal(row.discount),
    usedCount: row.usedCount,
    maxUsage: row.maxUsage,
    expire: row.expire,
    createdAt: row.createdAt,
  };
}

export async function getCoupons({
  page,
  limit,
  search,
  status,
}: GetCouponsParams): Promise<GetCouponsResult> {
  const offset = (page - 1) * limit;
  const searchPattern = search ? `%${search}%` : null;

  // active/exhausted need field-to-field comparison — must use raw SQL
  if (status === "active") {
    const [rows, countRows] = await Promise.all([
      prisma.$queryRaw<RawCouponRow[]>`
        SELECT id, name, discount::text,
               used_count AS "usedCount", max_usage AS "maxUsage",
               expire, created_at AS "createdAt"
        FROM coupons
        WHERE expire > NOW()
          AND (max_usage = 0 OR used_count < max_usage)
          ${searchPattern ? Prisma.sql`AND name ILIKE ${searchPattern}` : Prisma.empty}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: number }]>`
        SELECT CAST(COUNT(*) AS INTEGER) AS count
        FROM coupons
        WHERE expire > NOW()
          AND (max_usage = 0 OR used_count < max_usage)
          ${searchPattern ? Prisma.sql`AND name ILIKE ${searchPattern}` : Prisma.empty}
      `,
    ]);
    const total = Number(countRows[0].count);
    return { coupons: rows.map(mapRawRow), total, pageCount: Math.ceil(total / limit) };
  }

  if (status === "exhausted") {
    const [rows, countRows] = await Promise.all([
      prisma.$queryRaw<RawCouponRow[]>`
        SELECT id, name, discount::text,
               used_count AS "usedCount", max_usage AS "maxUsage",
               expire, created_at AS "createdAt"
        FROM coupons
        WHERE max_usage > 0 AND used_count >= max_usage
          ${searchPattern ? Prisma.sql`AND name ILIKE ${searchPattern}` : Prisma.empty}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: number }]>`
        SELECT CAST(COUNT(*) AS INTEGER) AS count
        FROM coupons
        WHERE max_usage > 0 AND used_count >= max_usage
          ${searchPattern ? Prisma.sql`AND name ILIKE ${searchPattern}` : Prisma.empty}
      `,
    ]);
    const total = Number(countRows[0].count);
    return { coupons: rows.map(mapRawRow), total, pageCount: Math.ceil(total / limit) };
  }

  // expired and no-filter use standard Prisma
  const where: Prisma.CouponWhereInput = {
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(status === "expired" ? { expire: { lte: new Date() } } : {}),
  };

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      select: {
        id: true,
        name: true,
        discount: true,
        usedCount: true,
        maxUsage: true,
        expire: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  return { coupons, total, pageCount: Math.ceil(total / limit) };
}
