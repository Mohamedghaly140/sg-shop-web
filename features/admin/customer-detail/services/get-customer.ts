import { notFound } from "next/navigation";
import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CustomerDetail = NonNullable<Awaited<ReturnType<typeof getCustomer>>>;

export async function getCustomer(id: string) {
  const customer = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      role: true,
      createdAt: true,
      addresses: true,
      orders: {
        select: {
          id: true,
          humanOrderId: true,
          status: true,
          paymentMethod: true,
          totalOrderPrice: true,
          isPaid: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer || customer.role !== Role.USER) notFound();
  return customer;
}
