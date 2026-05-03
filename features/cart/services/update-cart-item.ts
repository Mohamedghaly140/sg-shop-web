import { prisma } from "@/lib/prisma";

export async function updateCartItemQuantity({
  cartItemId,
  cartId,
  quantity,
}: {
  cartItemId: string;
  cartId: string;
  quantity: number;
}): Promise<void> {
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { id: cartItemId, cartId } });
    return;
  }

  await prisma.cartItem.updateMany({
    where: { id: cartItemId, cartId },
    data: { quantity },
  });
}
