"use client";

import { format } from "date-fns";
import { LucidePencil, LucideSearchX, LucideTicket } from "lucide-react";

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
import { useCouponsParams, PAGE_SIZE_OPTIONS } from "../hooks/use-coupons-params";
import { UpsertCouponDialog } from "./upsert-coupon-dialog";
import { DeleteCouponButton } from "./delete-coupon-button";
import { DeactivateCouponButton } from "./deactivate-coupon-button";
import type { CouponRow } from "../services/get-coupons";

type CouponsTableProps = {
  coupons: CouponRow[];
  pageCount: number;
};

type CouponStatus = "active" | "expired" | "exhausted";

function getCouponStatus(coupon: {
  expire: Date;
  usedCount: number;
  maxUsage: number;
}): CouponStatus {
  if (coupon.expire <= new Date()) return "expired";
  if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) return "exhausted";
  return "active";
}

const statusStyles: Record<CouponStatus, string> = {
  active: "border-green-500/30 bg-green-500/10 text-green-500",
  expired: "border-red-500/30 bg-red-500/10 text-red-500",
  exhausted: "border-orange-500/30 bg-orange-500/10 text-orange-400",
};

const statusLabels: Record<CouponStatus, string> = {
  active: "Active",
  expired: "Expired",
  exhausted: "Exhausted",
};

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

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="rounded-full bg-muted p-4">
          <LucideSearchX className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No coupons match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
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
        <LucideTicket className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">No coupons yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create your first coupon to get started
        </p>
      </div>
      <UpsertCouponDialog mode="create" />
    </div>
  );
}

export function CouponsTable({ coupons, pageCount }: CouponsTableProps) {
  const [params, setParams] = useCouponsParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const hasFilters = !!(params.search || params.status);

  const clearFilters = () => setParams({ search: null, status: null, page: 1 });

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        {coupons.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">
                      {coupon.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {Number(coupon.discount).toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.maxUsage > 0 ? (
                        <div className="flex flex-col gap-1 min-w-[100px]">
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${Math.min(100, (coupon.usedCount / coupon.maxUsage) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {coupon.usedCount} / {coupon.maxUsage}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {coupon.usedCount} / ∞
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(coupon.expire, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", statusStyles[status])}
                      >
                        {statusLabels[status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(coupon.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <UpsertCouponDialog
                          mode="edit"
                          coupon={coupon}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <LucidePencil className="w-4 h-4" />
                            </Button>
                          }
                        />
                        {status === "active" && (
                          <DeactivateCouponButton couponId={coupon.id} />
                        )}
                        <DeleteCouponButton
                          couponId={coupon.id}
                          couponName={coupon.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setParams({ page: page + 1 })}
                    aria-disabled={page >= pageCount}
                    className={cn(
                      page >= pageCount && "pointer-events-none opacity-50"
                    )}
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
