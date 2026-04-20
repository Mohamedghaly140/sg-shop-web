import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type GetCustomersParams = {
  page: number;
  limit: number;
  search: string;
  active: boolean | null;
};

export type CustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: Date;
  _count: { orders: number };
};

type GetCustomersResult = {
  customers: CustomerListItem[];
  total: number;
  pageCount: number;
};

export async function getCustomers({
  page,
  limit,
  search,
  active,
}: GetCustomersParams): Promise<GetCustomersResult> {
  const where = {
    role: Role.USER,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(active !== null ? { active } : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        active: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    customers,
    total,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}
