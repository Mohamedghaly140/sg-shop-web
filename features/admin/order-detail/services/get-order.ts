import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrder>>>;

export async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      shippingAddress: true,
      items: {
        include: {
          product: {
            select: { id: true, name: true, imageUrl: true, slug: true },
          },
        },
      },
      coupon: {
        select: { name: true, discount: true },
      },
    },
  });

  if (!order) notFound();
  return order;
}
