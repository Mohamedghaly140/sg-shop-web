import { type Prisma, OrderStatus, PaymentMethod } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type GetOrdersParams = {
  page: number;
  limit: number;
  search: string;
  status: OrderStatus | null;
};

export type OrderListItem = {
  id: string;
  humanOrderId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  totalOrderPrice: number | null;
  createdAt: Date;
  customerName: string;
  itemsCount: number;
};

type GetOrdersResult = {
  orders: OrderListItem[];
  total: number;
  pageCount: number;
};

export async function getOrders({
  page,
  limit,
  search,
  status,
}: GetOrdersParams): Promise<GetOrdersResult> {
  const where: Prisma.OrderWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { humanOrderId: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { anonName: { contains: search, mode: "insensitive" } },
      { anonEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const [raw, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        humanOrderId: true,
        status: true,
        paymentMethod: true,
        isPaid: true,
        totalOrderPrice: true,
        createdAt: true,
        user: { select: { name: true } },
        anonName: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const orders: OrderListItem[] = raw.map((o) => ({
    id: o.id,
    humanOrderId: o.humanOrderId,
    status: o.status,
    paymentMethod: o.paymentMethod,
    isPaid: o.isPaid,
    totalOrderPrice: o.totalOrderPrice ? Number(o.totalOrderPrice) : null,
    createdAt: o.createdAt,
    customerName: o.user?.name ?? o.anonName ?? "Guest",
    itemsCount: o._count.items,
  }));

  return { orders, total, pageCount: Math.ceil(total / limit) };
}
