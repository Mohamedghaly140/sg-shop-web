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

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } =
      evt.data;

    const email = email_addresses[0]?.email_address ?? "";
    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim() || id;
    const phone = phone_numbers?.[0]?.phone_number ?? `pending_${id}`;
    const role = (public_metadata?.role as Role | undefined) ?? Role.USER;

    await prisma.user.create({
      data: { id, email, name, phone, role },
    });
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
      await prisma.user.update({
        where: { id },
        data: { active: false },
      });
    }
  }

  return new Response("OK", { status: 200 });
}
