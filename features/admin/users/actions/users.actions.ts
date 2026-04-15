"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/shared/form/utils/to-action-state";

// ─── Guards ───────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "ADMIN") {
    throw new Error("Unauthorized: ADMIN role required");
  }
}

// ─── Create User ──────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().min(7, "Phone must be at least 7 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(Role),
});

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = createUserSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role: formData.get("role"),
    });

    const [firstName, ...rest] = parsed.name.trim().split(" ");
    const lastName = rest.join(" ") || undefined;

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.createUser({
      emailAddress: [parsed.email],
      phoneNumber: [parsed.phone],
      password: parsed.password,
      firstName,
      lastName,
      username: parsed.email.split("@")[0].replace(/[^a-zA-Z0-9_.-]/g, "_"),
      publicMetadata: { role: parsed.role },
    });

    // Sync to DB immediately (webhook may lag)
    await prisma.user.upsert({
      where: { id: clerkUser.id },
      create: {
        id: clerkUser.id,
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        role: parsed.role,
        active: true,
      },
      update: {},
    });

    revalidatePath("/admin/users");
    return toActionState("SUCCESS", "User created successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

// ─── Update User ──────────────────────────────────────────────────────────────

const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(Role),
  active: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export async function updateUserAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = updateUserSchema.parse({
      userId: formData.get("userId"),
      role: formData.get("role"),
      active: formData.get("active"),
    });

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

// ─── Delete User ──────────────────────────────────────────────────────────────

const deleteUserSchema = z.object({
  userId: z.string().min(1),
});

export async function deleteUserAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const { userId: currentUserId } = await auth();

    const { userId } = deleteUserSchema.parse({
      userId: formData.get("userId"),
    });

    if (userId === currentUserId) {
      throw new Error("You cannot delete your own account");
    }

    await prisma.user.delete({ where: { id: userId } });

    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(userId);
    } catch {
      // User may not exist in Clerk (e.g. test data) — DB deletion still succeeds
    }

    revalidatePath("/admin/users");
    return toActionState("SUCCESS", "User deleted successfully");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
