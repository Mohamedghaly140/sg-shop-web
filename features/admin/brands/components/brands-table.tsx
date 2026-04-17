"use client";

import { format } from "date-fns";
import Image from "next/image";
import { LucidePencil, LucideSearchX, LucideTag } from "lucide-react";

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
import { useBrandsParams, PAGE_SIZE_OPTIONS } from "../hooks/use-brands-params";
import { UpsertBrandDialog } from "./upsert-brand-dialog";
import { DeleteBrandButton } from "./delete-brand-button";
import type { Brand } from "@/generated/prisma/client";

type BrandsTableProps = {
  brands: Pick<Brand, "id" | "name" | "slug" | "imageUrl" | "createdAt">[];
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
          <p className="text-sm font-medium">No brands match your search</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different keyword</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear search
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="rounded-full bg-muted p-4">
        <LucideTag className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">No brands yet</p>
        <p className="text-xs text-muted-foreground mt-1">Create your first brand to get started</p>
      </div>
      <UpsertBrandDialog mode="create" />
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

export function BrandsTable({ brands, pageCount }: BrandsTableProps) {
  const [params, setParams] = useBrandsParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const hasFilters = !!(params.search && params.search.length > 0);

  const clearFilters = () => setParams({ search: null, page: 1 });

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        {brands.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    {brand.imageUrl ? (
                      <Image
                        src={brand.imageUrl}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="size-10 rounded-md border object-cover bg-muted"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                        <LucideTag className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">{brand.slug}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(brand.createdAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <UpsertBrandDialog
                        mode="edit"
                        brand={brand}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <LucidePencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DeleteBrandButton brandId={brand.id} brandName={brand.name} />
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
