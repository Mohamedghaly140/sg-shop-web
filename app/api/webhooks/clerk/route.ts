import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Verification failed", { status: 400 });
  }

  try {
    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } =
        evt.data;

      const email = email_addresses[0]?.email_address ?? "";
      const name = `${first_name ?? ""} ${last_name ?? ""}`.trim() || id;
      const phone = phone_numbers?.[0]?.phone_number ?? `pending_${id}`;
      const role = (public_metadata?.role as Role | undefined) ?? Role.USER;

      await prisma.user.upsert({
        where: { id },
        create: { id, email, name, phone, role },
        update: { email, name, role },
      });

      // Only backfill role if it isn't already set in Clerk metadata
      if (!public_metadata?.role) {
        const existingPublic =
          public_metadata && typeof public_metadata === "object" && !Array.isArray(public_metadata)
            ? { ...(public_metadata as Record<string, unknown>) }
            : {};

        try {
          const client = await clerkClient();
          await client.users.updateUser(id, {
            publicMetadata: { ...existingPublic, role },
          });
        } catch (clerkErr) {
          // Non-fatal: DB user was already saved. Log and continue.
          console.error("Failed to backfill Clerk role metadata:", clerkErr);
        }
      }
    }

    if (evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } =
        evt.data;

      const email = email_addresses[0]?.email_address ?? undefined;
      const name =
        first_name !== undefined || last_name !== undefined
          ? `${first_name ?? ""} ${last_name ?? ""}`.trim()
          : undefined;
      const role = (public_metadata?.role as Role | undefined) ?? undefined;

      // Only update phone if a real number is provided (don't overwrite a real phone with a placeholder)
      const incomingPhone = phone_numbers?.[0]?.phone_number;
      const phoneUpdate = incomingPhone ? { phone: incomingPhone } : {};

      await prisma.user.update({
        where: { id },
        data: { email, name, role, ...phoneUpdate },
      });
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        await prisma.user.deleteMany({
          where: { id },
        });
      }
    }
  } catch (err) {
    console.error("Clerk webhook handler error:", err);
    return new Response("Internal error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
