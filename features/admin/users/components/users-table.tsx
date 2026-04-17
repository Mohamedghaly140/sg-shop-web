"use client";

import { format } from "date-fns";
import { LucidePencil, LucideUsers, LucideSearchX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useUsersParams, PAGE_SIZE_OPTIONS } from "../hooks/use-users-params";
import { UpsertUserDialog } from "./upsert-user-dialog";
import { DeleteUserButton } from "./delete-user-button";
import type { User } from "@/generated/prisma/client";

type UsersTableProps = {
  users: Pick<User, "id" | "name" | "email" | "phone" | "role" | "active" | "createdAt">[];
  pageCount: number;
  currentUserId: string | null;
};

const roleStyles: Record<string, string> = {
  ADMIN: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  MANAGER: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  USER: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="rounded-full bg-muted p-4">
          <LucideSearchX className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No users match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="rounded-full bg-muted p-4">
        <LucideUsers className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">No users yet</p>
        <p className="text-xs text-muted-foreground mt-1">Create your first user to get started</p>
      </div>
      <UpsertUserDialog mode="create" />
    </div>
  );
}

function getPageRange(page: number, pageCount: number): (number | "ellipsis")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const delta = 1;
  const left = Math.max(2, page - delta);
  const right = Math.min(pageCount - 1, page + delta);
  const pages: (number | "ellipsis")[] = [1];

  if (left > 2) pages.push("ellipsis");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < pageCount - 1) pages.push("ellipsis");
  pages.push(pageCount);

  return pages;
}

export function UsersTable({ users, pageCount, currentUserId }: UsersTableProps) {
  const [params, setParams] = useUsersParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const hasFilters = !!(params.search || params.role || params.active !== null);

  const clearFilters = () => setParams({ search: null, role: null, active: null, page: 1 });

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        {users.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
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
                            <LucidePencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      {user.id !== currentUserId && (
                        <DeleteUserButton userId={user.id} userName={user.name} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pageCount > 0 && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => setParams({ limit: Number(v), page: 1 })}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {pageCount > 1 && (
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setParams({ page: page - 1 })}
                    aria-disabled={page <= 1}
                    className={cn(page <= 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {getPageRange(page, pageCount).map((p, i) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        onClick={() => setParams({ page: p })}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setParams({ page: page + 1 })}
                    aria-disabled={page >= pageCount}
                    className={cn(page >= pageCount && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
