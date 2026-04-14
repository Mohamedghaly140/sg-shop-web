import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { AdminShell } from "./_components/shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role as
    | "ADMIN"
    | "MANAGER";
  const cookieStore = await cookies();
  const defaultCollapsed =
    cookieStore.get("admin_sidebar_collapsed")?.value === "true";

  return (
    <AdminShell defaultCollapsed={defaultCollapsed} role={role ?? "MANAGER"}>
      {children}
    </AdminShell>
  );
}
