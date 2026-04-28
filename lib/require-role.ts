import { auth } from "@clerk/nextjs/server";

export async function requireAdmin(): Promise<string> {
  const { sessionClaims, userId } = await auth();
  if (sessionClaims?.metadata?.role !== "ADMIN") {
    throw new Error("Unauthorized: ADMIN role required");
  }
  return userId!;
}

export async function requireManagerOrAdmin(): Promise<string> {
  const { sessionClaims, userId } = await auth();
  const role = sessionClaims?.metadata?.role;
  if (!userId || (role !== "MANAGER" && role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }
  return userId;
}
