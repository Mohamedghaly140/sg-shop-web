"use client";

import { format } from "date-fns";
import Image from "next/image";
import { LucidePencil, LucideSearchX, LucideFolder } from "lucide-react";

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
import { getPageRange } from "@/lib/utils/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { useCategoriesParams, PAGE_SIZE_OPTIONS } from "../hooks/use-categories-params";
import { UpsertCategoryDialog } from "./upsert-category-dialog";
import { DeleteCategoryButton } from "./delete-category-button";
import { ManageSubcategoriesDialog } from "./manage-subcategories-dialog";
import type { CategoryRow } from "../services/get-categories";

type CategoriesTableProps = {
  categories: CategoryRow[];
  pageCount: number;
};

export function CategoriesTable({ categories, pageCount }: CategoriesTableProps) {
  const [params, setParams] = useCategoriesParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const hasFilters = !!(params.search && params.search.length > 0);

  function handleClearFilters() {
    setParams({ search: null, page: 1 });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        {categories.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={<LucideSearchX className="size-6 text-muted-foreground" />}
              title="No categories match your search"
              description="Try a different keyword"
              action={
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<LucideFolder className="size-6 text-muted-foreground" />}
              title="No categories yet"
              description="Create your first category to get started"
              action={<UpsertCategoryDialog mode="create" />}
            />
          )
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Subcategories</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="size-10 rounded-md border object-cover bg-muted"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                        <LucideFolder className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {category.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.subCategories.length}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(category.createdAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ManageSubcategoriesDialog
                        categoryId={category.id}
                        categoryName={category.name}
                        subCategories={category.subCategories}
                      />
                      <UpsertCategoryDialog
                        mode="edit"
                        category={category}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <LucidePencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DeleteCategoryButton
                        categoryId={category.id}
                        categoryName={category.name}
                      />
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
