"use client";

import Link from "next/link";
import { useCallback } from "react";
import { LucidePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductStatus } from "@/generated/prisma/enums";
import type { ProductFilterOptions } from "../services/get-product-filter-options";
import { useProductsParams } from "../hooks/use-products-params";
import { ProductsFilterPopover } from "./products-filter-popover";

type ProductsToolbarProps = {
  total: number;
  options: ProductFilterOptions;
};

const ALL = "__ALL__";

export function ProductsToolbar({ total, options }: ProductsToolbarProps) {
  const [params, setParams] = useProductsParams();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParams({ search: e.target.value || null, page: 1 });
    },
    [setParams],
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search by name or slug…"
          value={params.search ?? ""}
          onChange={handleSearch}
          className="max-w-xs"
        />
        <Select
          value={params.status ?? ALL}
          onValueChange={v =>
            setParams({
              status: v === ALL ? null : (v as ProductStatus),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value={ProductStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={ProductStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={ProductStatus.ARCHIVED}>Archived</SelectItem>
          </SelectContent>
        </Select>
        <ProductsFilterPopover options={options} />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {total} product{total !== 1 ? "s" : ""}
        </span>
        <Button size="sm" asChild>
          <Link href="/admin/products/new">
            <LucidePlus className="size-4" />
            New product
          </Link>
        </Button>
      </div>
    </div>
  );
}
