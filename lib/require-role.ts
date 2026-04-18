import { auth } from "@clerk/nextjs/server";

export async function requireAdmin(): Promise<string> {
  const { sessionClaims, userId } = await auth();
  if (sessionClaims?.metadata?.role !== "ADMIN") {
    throw new Error("Unauthorized: ADMIN role required");
  }
  return userId!;
}

export async function requireManagerOrAdmin(): Promise<void> {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;
  if (role !== "MANAGER" && role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}
