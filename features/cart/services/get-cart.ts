import { prisma } from "@/lib/prisma";

export type CartItemData = {
  id: string;
  quantity: number;
  price: string;
  color: string | null;
  size: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
  };
};

export type CartData = {
  id: string;
  items: CartItemData[];
  itemCount: number;
  subtotal: string;
};

export async function getCart({
  userId,
  sessionToken,
}: {
  userId: string | null;
  sessionToken: string | null;
}): Promise<CartData | null> {
  if (!userId && !sessionToken) return null;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionToken },
    select: {
      id: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          color: true,
          size: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              priceAfterDiscount: true,
            },
          },
        },
      },
    },
  });

  if (!cart) return null;

  let subtotalCents = 0;
  let itemCount = 0;

  const items: CartItemData[] = cart.items.map((item) => {
    const unitPrice = item.price ?? item.product.priceAfterDiscount;
    subtotalCents += Number(unitPrice) * item.quantity;
    itemCount += item.quantity;

    return {
      id: item.id,
      quantity: item.quantity,
      price: unitPrice.toString(),
      color: item.color,
      size: item.size,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl,
      },
    };
  });

  return {
    id: cart.id,
    items,
    itemCount,
    subtotal: subtotalCents.toFixed(2),
  };
}

export async function getCartCount({
  userId,
  sessionToken,
}: {
  userId: string | null;
  sessionToken: string | null;
}): Promise<number> {
  if (!userId && !sessionToken) return 0;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionToken },
    select: { items: { select: { quantity: true } } },
  });

  return cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
}
