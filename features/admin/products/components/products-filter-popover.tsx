"use client";

import { LucideFilter, LucideX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ProductFilterOptions } from "../services/get-product-filter-options";
import { useProductsParams } from "../hooks/use-products-params";

type ProductsFilterPopoverProps = {
  options: ProductFilterOptions;
};

const ALL = "__ALL__";

export function ProductsFilterPopover({ options }: ProductsFilterPopoverProps) {
  const [params, setParams] = useProductsParams();
  const activeCount = [
    params.categoryId,
    params.brandId,
    params.featured !== null ? "x" : null,
  ].filter(Boolean).length;

  const clear = () =>
    setParams({
      categoryId: null,
      brandId: null,
      featured: null,
      page: 1,
    });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LucideFilter className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Refine products</p>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={clear}
            >
              <LucideX className="size-3" /> Clear
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select
            value={params.categoryId ?? ALL}
            onValueChange={(v) =>
              setParams({ categoryId: v === ALL ? null : v, page: 1 })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {options.categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Brand</Label>
          <Select
            value={params.brandId ?? ALL}
            onValueChange={(v) =>
              setParams({ brandId: v === ALL ? null : v, page: 1 })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All brands</SelectItem>
              {options.brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Featured only</Label>
            <p className="text-[11px] text-muted-foreground">
              Show only products flagged as featured
            </p>
          </div>
          <Switch
            checked={params.featured === true}
            onCheckedChange={(checked) =>
              setParams({ featured: checked ? true : null, page: 1 })
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
