"use client";

import { format } from "date-fns";
import { PencilIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useUsersParams } from "../hooks/use-users-params";
import { UpsertUserDialog } from "./upsert-user-dialog";
import { DeleteUserButton } from "./delete-user-button";
import type { User } from "@/generated/prisma/client";

type UsersTableProps = {
  users: Pick<User, "id" | "name" | "email" | "phone" | "role" | "active" | "createdAt">[];
  pageCount: number;
};

const roleStyles: Record<string, string> = {
  ADMIN: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  MANAGER: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  USER: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

export function UsersTable({ users, pageCount }: UsersTableProps) {
  const [params, setParams] = useUsersParams();
  const page = params.page ?? 1;

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        {users.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No users found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-sm">{user.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", roleStyles[user.role] ?? "")}
                    >
                      {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        user.active
                          ? "border-green-500/30 bg-green-500/10 text-green-500"
                          : "border-red-500/30 bg-red-500/10 text-red-500"
                      )}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(user.createdAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <UpsertUserDialog
                        mode="edit"
                        user={user}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DeleteUserButton userId={user.id} userName={user.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setParams({ page: page - 1 })}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setParams({ page: page + 1 })}
          >
            Next
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
