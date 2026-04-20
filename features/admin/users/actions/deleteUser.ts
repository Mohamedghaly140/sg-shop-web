"use server";

import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireAdmin } from "@/lib/require-role";

const deleteUserSchema = z.object({
  userId: z.string().min(1),
});

export async function deleteUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const currentUserId = await requireAdmin();

    const { userId } = deleteUserSchema.parse({
      userId: formData.get("userId"),
    });

    if (userId === currentUserId) {
      throw new Error("You cannot delete your own account");
    }

    const clerk = await clerkClient();
    try {
      await clerk.users.deleteUser(userId);
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err) && err.status === 404) {
        // 404 = user doesn't exist in Clerk (e.g. test data) — proceed to DB deletion
      } else {
        throw err;
      }
    }

    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/admin/users");
    return toActionState("SUCCESS", "User deleted successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
