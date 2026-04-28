"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";
import { requireAdmin } from "@/lib/require-role";

const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(Role),
  active: z.enum(["true", "false"]).transform((v) => v === "true"),
});

type ParsedUserUpdate = z.infer<typeof updateUserSchema>;

async function assertUserUpdateAllowed(
  currentUserId: string,
  update: ParsedUserUpdate,
): Promise<void> {
  const targetUser = await prisma.user.findUnique({
    where: { id: update.userId },
    select: {
      id: true,
      role: true,
      active: true,
    },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  const isSelfUpdate = targetUser.id === currentUserId;
  if (isSelfUpdate && targetUser.role !== update.role) {
    throw new Error("You cannot change your own role");
  }

  if (isSelfUpdate && !update.active) {
    throw new Error("You cannot deactivate your own account");
  }

  const removesActiveAdmin =
    targetUser.role === Role.ADMIN &&
    targetUser.active &&
    (update.role !== Role.ADMIN || !update.active);

  if (!removesActiveAdmin) return;

  const otherActiveAdmins = await prisma.user.count({
    where: {
      id: { not: targetUser.id },
      role: Role.ADMIN,
      active: true,
    },
  });

  if (otherActiveAdmins === 0) {
    throw new Error("At least one active admin account is required");
  }
}

export async function updateUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const currentUserId = await requireAdmin();

    const parsed = updateUserSchema.parse({
      userId: formData.get("userId"),
      role: formData.get("role"),
      active: formData.get("active"),
    });

    await assertUserUpdateAllowed(currentUserId, parsed);

    const clerk = await clerkClient();
    // Update Clerk first (source of truth for roles), then mirror to DB.
    // Sequential order prevents the webhook from overwriting a successful DB
    // update if Clerk had already failed.
    await clerk.users.updateUser(parsed.userId, {
      publicMetadata: { role: parsed.role },
    });
    if (parsed.active) {
      await clerk.users.unbanUser(parsed.userId);
    } else {
      await clerk.users.banUser(parsed.userId);
    }
    await prisma.user.update({
      where: { id: parsed.userId },
      data: { role: parsed.role, active: parsed.active },
    });

    revalidatePath("/admin/users");
    return toActionState("SUCCESS", "User updated successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
