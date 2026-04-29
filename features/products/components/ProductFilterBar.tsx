"use client";

import { LucideChevronDown, LucideX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterOptions } from "../types";
import { useProductParams } from "../hooks/useProductParams";

type ProductFilterBarProps = {
  options: FilterOptions;
};

const ACTIVE_CHIP =
  "border-foreground text-foreground bg-[oklch(0.96_0.008_85)] hover:bg-[oklch(0.96_0.008_85)]";
const INACTIVE_CHIP =
  "border-border text-muted-foreground hover:border-foreground hover:text-foreground";

export function ProductFilterBar({ options }: ProductFilterBarProps) {
  const [params, setParams] = useProductParams();

  const activeCount = [
    params.category,
    params.brand,
    params.size,
    params.color,
    params.minPrice > 0 ? "x" : null,
    params.maxPrice > 0 ? "x" : null,
  ].filter(Boolean).length;

  const hasPriceFilter = params.minPrice > 0 || params.maxPrice > 0;

  function handleClearAll() {
    setParams({
      category: "",
      brand: "",
      minPrice: 0,
      maxPrice: 0,
      size: "",
      color: "",
      page: 1,
    });
  }

  function handleCategoryChange(value: string) {
    setParams({ category: value === "all" ? "" : value, page: 1 });
  }

  function handleBrandChange(value: string) {
    setParams({ brand: value === "all" ? "" : value, page: 1 });
  }

  function handleSizeToggle(size: string) {
    setParams({ size: params.size === size ? "" : size, page: 1 });
  }

  function handleColorToggle(color: string) {
    setParams({ color: params.color === color ? "" : color, page: 1 });
  }

  function handleMinPriceBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setParams({ minPrice: isNaN(val) ? 0 : val, page: 1 });
  }

  function handleMaxPriceBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setParams({ maxPrice: isNaN(val) ? 0 : val, page: 1 });
  }

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4 h-12">
          <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-none min-w-0">
            {options.categories.length > 0 && (
              <Select
                value={params.category || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger
                  className={cn(
                    "h-7 shrink-0 gap-1 border font-sans text-xs tracking-wide px-3 rounded-none focus:ring-0 focus:ring-offset-0",
                    params.category ? ACTIVE_CHIP : INACTIVE_CHIP
                  )}
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all" className="text-xs">
                    All Categories
                  </SelectItem>
                  {options.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug} className="text-xs">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {options.brands.length > 0 && (
              <Select
                value={params.brand || "all"}
                onValueChange={handleBrandChange}
              >
                <SelectTrigger
                  className={cn(
                    "h-7 shrink-0 gap-1 border font-sans text-xs tracking-wide px-3 rounded-none focus:ring-0 focus:ring-offset-0",
                    params.brand ? ACTIVE_CHIP : INACTIVE_CHIP
                  )}
                >
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all" className="text-xs">
                    All Brands
                  </SelectItem>
                  {options.brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.slug} className="text-xs">
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {options.sizes.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {options.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={cn(
                      "h-7 px-3 border font-sans text-xs tracking-wide transition-colors",
                      params.size === size ? ACTIVE_CHIP : INACTIVE_CHIP
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            {options.colors.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {options.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={cn(
                      "h-7 px-3 border font-sans text-xs tracking-wide transition-colors",
                      params.color === color ? ACTIVE_CHIP : INACTIVE_CHIP
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex h-7 shrink-0 items-center gap-1 border px-3 font-sans text-xs tracking-wide transition-colors",
                    hasPriceFilter ? ACTIVE_CHIP : INACTIVE_CHIP
                  )}
                >
                  {hasPriceFilter
                    ? `LE ${params.minPrice > 0 ? params.minPrice.toLocaleString() : "0"} – ${params.maxPrice > 0 ? params.maxPrice.toLocaleString() : "∞"}`
                    : "Price"}
                  <LucideChevronDown className="size-3 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 rounded-none p-3">
                <p className="font-sans text-xs tracking-[0.15em] uppercase text-foreground mb-3">
                  Price Range
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min={0}
                    defaultValue={params.minPrice > 0 ? params.minPrice : ""}
                    onBlur={handleMinPriceBlur}
                    className="h-8 text-xs rounded-none"
                  />
                  <span className="font-sans text-xs text-muted-foreground shrink-0">
                    to
                  </span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min={0}
                    defaultValue={params.maxPrice > 0 ? params.maxPrice : ""}
                    onBlur={handleMaxPriceBlur}
                    className="h-8 text-xs rounded-none"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {activeCount > 0 && (
            <button
              onClick={handleClearAll}
              className="flex shrink-0 items-center gap-1 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LucideX className="size-3" />
              Clear ({activeCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
