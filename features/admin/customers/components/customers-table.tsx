"use client";

import Link from "next/link";
import { format } from "date-fns";
import { LucideEye, LucideSearchX, LucideUsers } from "lucide-react";

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
import { useCustomersParams, PAGE_SIZE_OPTIONS } from "../hooks/use-customers-params";
import type { CustomerListItem } from "../services/get-customers";
import { ToggleCustomerActiveButton } from "./toggle-customer-active-button";

type CustomersTableProps = {
  customers: CustomerListItem[];
  pageCount: number;
};

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="rounded-full bg-muted p-4">
          <LucideSearchX className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No customers match your filters</p>
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
        <p className="text-sm font-medium">No customers yet</p>
        <p className="text-xs text-muted-foreground mt-1">Customers will appear here once they sign up</p>
      </div>
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

export function CustomersTable({ customers, pageCount }: CustomersTableProps) {
  const [params, setParams] = useCustomersParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const hasFilters = !!(params.search || params.active !== null);

  const clearFilters = () => setParams({ search: null, active: null, page: 1 });

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        {customers.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.email}
                  </TableCell>
                  <TableCell className="text-sm">{customer.phone}</TableCell>
                  <TableCell className="text-sm">{customer._count.orders}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        customer.active
                          ? "border-green-500/30 bg-green-500/10 text-green-500"
                          : "border-red-500/30 bg-red-500/10 text-red-500"
                      )}
                    >
                      {customer.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(customer.createdAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ToggleCustomerActiveButton
                        customerId={customer.id}
                        active={customer.active}
                      />
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>
                          <LucideEye className="w-4 h-4" />
                          <span className="sr-only">View customer</span>
                        </Link>
                      </Button>
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
