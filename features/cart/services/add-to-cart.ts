import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import { CART_SESSION_MAX_AGE } from "../constants";

export async function addToCart({
  productId,
  userId,
  sessionToken,
}: {
  productId: string;
  userId: string | null;
  sessionToken: string | null;
}): Promise<{ newSessionToken: string | null }> {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    select: { price: true, quantity: true, status: true },
  });

  if (product.status !== ProductStatus.ACTIVE || product.quantity === 0) {
    throw new Error("This product is unavailable");
  }

  const token = sessionToken ?? crypto.randomUUID();
  const newSessionToken = !userId && !sessionToken ? token : null;

  const cartWhere = userId ? { userId } : { sessionToken: token };

  let cart = await prisma.cart.findFirst({
    where: cartWhere,
    select: { id: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: userId
        ? { userId }
        : {
            sessionToken: token,
            expiresAt: new Date(Date.now() + CART_SESSION_MAX_AGE * 1000),
          },
      select: { id: true },
    });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
    select: { id: true },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: 1 } },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: 1, price: product.price },
    });
  }

  return { newSessionToken };
}
