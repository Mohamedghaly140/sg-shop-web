"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { LucidePackage, LucideSearchX, LucideStar } from "lucide-react";

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
import { getPageRange } from "@/lib/utils/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { PAGE_SIZE_OPTIONS, useProductsParams } from "../hooks/use-products-params";
import type { ProductListItem } from "../services/get-products";
import { ProductStatusBadge } from "./status-badge";
import { ProductRowActions } from "./product-row-actions";

type ProductsTableProps = {
  products: ProductListItem[];
  pageCount: number;
};

function formatMoney(value: string) {
  const n = Number(value);
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value;
}

export function ProductsTable({ products, pageCount }: ProductsTableProps) {
  const [params, setParams] = useProductsParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const hasFilters = Boolean(
    params.search ||
      params.status ||
      params.categoryId ||
      params.brandId ||
      params.featured !== null,
  );

  function handleClearFilters() {
    setParams({ search: null, status: null, categoryId: null, brandId: null, featured: null, page: 1 });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        {products.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={<LucideSearchX className="size-6 text-muted-foreground" />}
              title="No products match these filters"
              description="Adjust your search or filters"
              action={
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<LucidePackage className="size-6 text-muted-foreground" />}
              title="No products yet"
              description="Create your first product to get started"
              action={
                <Button size="sm" asChild>
                  <Link href="/admin/products/new">New product</Link>
                </Button>
              }
            />
          )
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const hasDiscount =
                  Number(product.discount) > 0 &&
                  product.priceAfterDiscount !== product.price;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="block size-10 overflow-hidden rounded-md border bg-muted"
                      >
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt=""
                            width={40}
                            height={40}
                            unoptimized
                            className="size-10 object-cover"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center">
                            <LucidePackage className="size-4 text-muted-foreground" />
                          </div>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex flex-col hover:underline"
                      >
                        <span className="font-medium flex items-center gap-1.5">
                          {product.name}
                          {product.featured && (
                            <LucideStar className="size-3.5 fill-amber-400 text-amber-400" />
                          )}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {product.slug}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>{product.category?.name ?? "—"}</span>
                        {product.brand && (
                          <span className="text-muted-foreground">{product.brand.name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasDiscount ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-medium">
                            {formatMoney(product.priceAfterDiscount)}
                          </span>
                          <span className="text-muted-foreground line-through">
                            {formatMoney(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium">
                          {formatMoney(product.price)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-xs",
                          product.quantity === 0 && "text-destructive font-medium",
                        )}
                      >
                        {product.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ProductStatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(product.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <ProductRowActions product={product} />
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
