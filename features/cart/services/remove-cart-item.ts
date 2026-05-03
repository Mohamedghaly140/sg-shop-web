import { prisma } from "@/lib/prisma";

export async function removeCartItem({
  cartItemId,
  cartId,
}: {
  cartItemId: string;
  cartId: string;
}): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, cartId },
  });
}
