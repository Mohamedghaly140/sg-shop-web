import type { User } from "@/generated/prisma/client";
import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "../hooks/use-users-params";

type GetUsersParams = {
  page: number;
  search: string;
  role: "USER" | "MANAGER" | "ADMIN" | null;
  active: boolean | null;
};

type GetUsersResult = {
  users: Pick<User, "id" | "name" | "email" | "phone" | "role" | "active" | "createdAt">[];
  total: number;
  pageCount: number;
};

export async function getUsers({
  page,
  search,
  role,
  active,
}: GetUsersParams): Promise<GetUsersResult> {
  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role ? { role: role as Role } : {}),
    ...(active !== null ? { active } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}
