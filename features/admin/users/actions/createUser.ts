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

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().min(7, "Phone must be at least 7 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(Role),
});

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
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
