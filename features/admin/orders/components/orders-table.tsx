"use client";

import { format } from "date-fns";
import Link from "next/link";
import {
  LucideEye,
  LucidePackage,
  LucideSearchX,
} from "lucide-react";
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
import { OrderStatus, PaymentMethod } from "@/generated/prisma/client";
import { useOrdersParams, PAGE_SIZE_OPTIONS } from "../hooks/use-orders-params";
import type { OrderListItem } from "../services/get-orders";

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  PENDING:    "bg-amber-100 text-amber-800 border-amber-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED:    "bg-indigo-100 text-indigo-800 border-indigo-200",
  DELIVERED:  "bg-green-100 text-green-800 border-green-200",
  CANCELLED:  "bg-red-100 text-red-800 border-red-200",
  REFUNDED:   "bg-orange-100 text-orange-800 border-orange-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

type OrdersTableProps = {
  orders: OrderListItem[];
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
          <p className="text-sm font-medium">No orders match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different keyword or status</p>
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
        <LucidePackage className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">No orders yet</p>
        <p className="text-xs text-muted-foreground mt-1">Orders will appear here once customers checkout</p>
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

export function OrdersTable({ orders, pageCount }: OrdersTableProps) {
  const [params, setParams] = useOrdersParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const hasFilters = !!(params.search?.length || params.status);

  const clearFilters = () => setParams({ search: null, status: null, page: 1 });

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        {orders.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {order.humanOrderId}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    {order.customerName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium", STATUS_BADGE_CLASS[order.status])}
                    >
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm">{order.paymentMethod === PaymentMethod.CARD ? "Card" : "Cash"}</span>
                      <span className={cn("text-xs", order.isPaid ? "text-green-600" : "text-muted-foreground")}>
                        {order.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {order.itemsCount}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {order.totalOrderPrice != null
                      ? `EGP ${order.totalOrderPrice.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(order.createdAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <LucideEye className="w-4 h-4" />
                      </Link>
                    </Button>
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
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
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
                  ),
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
