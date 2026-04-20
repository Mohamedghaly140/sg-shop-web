import type { Coupon } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type GetCouponsParams = {
  page: number;
  limit: number;
  search: string;
  status: "active" | "expired" | "exhausted" | "deactivated" | null;
};

export type CouponRow = Pick<
  Coupon,
  "id" | "name" | "discount" | "usedCount" | "maxUsage" | "expire" | "isActive" | "createdAt"
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
  isActive: boolean;
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
    isActive: row.isActive,
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

  // active/exhausted/deactivated need field-to-field comparison — must use raw SQL
  if (status === "active") {
    const [rows, countRows] = await Promise.all([
      prisma.$queryRaw<RawCouponRow[]>`
        SELECT id, name, discount::text,
               "usedCount", "maxUsage",
               expire, "isActive", "createdAt"
        FROM coupons
        WHERE "isActive" = true
          AND expire > NOW()
          AND ("maxUsage" = 0 OR "usedCount" < "maxUsage")
          ${searchPattern ? Prisma.sql`AND name ILIKE ${searchPattern}` : Prisma.empty}
        ORDER BY "createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: number }]>`
        SELECT CAST(COUNT(*) AS INTEGER) AS count
        FROM coupons
        WHERE "isActive" = true
          AND expire > NOW()
          AND ("maxUsage" = 0 OR "usedCount" < "maxUsage")
          ${searchPattern ? Prisma.sql`AND name ILIKE ${searchPattern}` : Prisma.empty}
      `,
    ]);
    const total = Number(countRows[0].count);
    return { coupons: rows.map(mapRawRow), total, pageCount: Math.ceil(total / limit) };
  }

  if (status === "deactivated") {
    const [rows, countRows] = await Promise.all([
      prisma.$queryRaw<RawCouponRow[]>`
        SELECT id, name, discount::text,
               "usedCount", "maxUsage",
               expire, "isActive", "createdAt"
        FROM coupons
        WHERE "isActive" = false
          ${searchPattern ? Prisma.sql`AND name ILIKE ${searchPattern}` : Prisma.empty}
        ORDER BY "createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: number }]>`
        SELECT CAST(COUNT(*) AS INTEGER) AS count
        FROM coupons
        WHERE "isActive" = false
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
               "usedCount", "maxUsage",
               expire, "isActive", "createdAt"
        FROM coupons
        WHERE "maxUsage" > 0 AND "usedCount" >= "maxUsage"
          ${searchPattern ? Prisma.sql`AND name ILIKE ${searchPattern}` : Prisma.empty}
        ORDER BY "createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: number }]>`
        SELECT CAST(COUNT(*) AS INTEGER) AS count
        FROM coupons
        WHERE "maxUsage" > 0 AND "usedCount" >= "maxUsage"
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
        isActive: true,
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
