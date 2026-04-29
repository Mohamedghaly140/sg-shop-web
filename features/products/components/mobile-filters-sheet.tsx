"use client";

import { useRef, useState } from "react";
import { LucideSlidersHorizontal, LucideX } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { FilterOptions } from "../types";
import { useProductParams } from "../hooks/use-product-params";

type MobileFiltersSheetProps = {
  options: FilterOptions;
  activeCount: number;
};

const ACTIVE_CHIP = "border-foreground bg-foreground text-background";
const INACTIVE_CHIP =
  "border-border text-muted-foreground hover:border-foreground hover:text-foreground";

export function MobileFiltersSheet({
  options,
  activeCount,
}: MobileFiltersSheetProps) {
  const [params, setParams] = useProductParams();

  const [localMin, setLocalMin] = useState(() =>
    params.minPrice > 0 ? String(params.minPrice) : ""
  );
  const [localMax, setLocalMax] = useState(() =>
    params.maxPrice > 0 ? String(params.maxPrice) : ""
  );
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function schedulePriceUpdate(min: string, max: string) {
    if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
    priceTimerRef.current = setTimeout(() => {
      const minVal = parseFloat(min);
      const maxVal = parseFloat(max);
      setParams({
        minPrice: isNaN(minVal) || min === "" ? 0 : minVal,
        maxPrice: isNaN(maxVal) || max === "" ? 0 : maxVal,
        page: 1,
      });
    }, 600);
  }

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setLocalMin(val);
    schedulePriceUpdate(val, localMax);
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setLocalMax(val);
    schedulePriceUpdate(localMin, val);
  }

  function handleClearAll() {
    if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
    setLocalMin("");
    setLocalMax("");
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

  function handleSizeToggle(size: string) {
    setParams({ size: params.size === size ? "" : size, page: 1 });
  }

  function handleColorToggle(color: string) {
    setParams({ color: params.color === color ? "" : color, page: 1 });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="gap-2 lg:hidden rounded-none">
          <LucideSlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center bg-foreground px-1.5 text-[0.625rem] font-medium text-background">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" showCloseButton={false} className="max-h-[85dvh] flex flex-col rounded-none px-0 gap-0 overflow-hidden">
        <SheetHeader className="shrink-0 flex flex-row items-center justify-between border-b border-border px-4 py-3">
          <SheetTitle className="font-sans text-xs tracking-[0.2em] uppercase font-normal">
            Filters {activeCount > 0 && `(${activeCount})`}
          </SheetTitle>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 gap-1 px-2 text-xs"
            >
              <LucideX className="size-3" />
              Clear all
            </Button>
          )}
        </SheetHeader>

        <div className="overflow-y-auto flex-1">
        <Accordion
          type="multiple"
          defaultValue={["category", "brand", "price", "size", "color"]}
          className="px-4"
        >
          {options.categories.length > 0 && (
            <AccordionItem value="category">
              <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase py-4 hover:no-underline">
                Category
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pb-2">
                  {options.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setParams({
                          category:
                            params.category === cat.slug ? "" : cat.slug,
                          page: 1,
                        })
                      }
                      className={cn(
                        "w-full text-left px-3 py-2 font-sans text-sm transition-colors",
                        params.category === cat.slug
                          ? "bg-foreground text-background"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {options.brands.length > 0 && (
            <AccordionItem value="brand">
              <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase py-4 hover:no-underline">
                Brand
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pb-2">
                  {options.brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() =>
                        setParams({
                          brand:
                            params.brand === brand.slug ? "" : brand.slug,
                          page: 1,
                        })
                      }
                      className={cn(
                        "w-full text-left px-3 py-2 font-sans text-sm transition-colors",
                        params.brand === brand.slug
                          ? "bg-foreground text-background"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="price">
            <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase py-4 hover:no-underline">
              Price
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-2 pb-4">
                <Input
                  type="number"
                  placeholder="Min"
                  min={0}
                  value={localMin}
                  onChange={handleMinChange}
                  className="h-9 text-sm rounded-none"
                />
                <span className="font-sans text-xs text-muted-foreground shrink-0">
                  to
                </span>
                <Input
                  type="number"
                  placeholder="Max"
                  min={0}
                  value={localMax}
                  onChange={handleMaxChange}
                  className="h-9 text-sm rounded-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {options.sizes.length > 0 && (
            <AccordionItem value="size">
              <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase py-4 hover:no-underline">
                Size
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pb-4">
                  {options.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={cn(
                        "px-3 py-1.5 border font-sans text-xs transition-colors",
                        params.size === size ? ACTIVE_CHIP : INACTIVE_CHIP
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {options.colors.length > 0 && (
            <AccordionItem value="color">
              <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase py-4 hover:no-underline">
                Color
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pb-4">
                  {options.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={cn(
                        "px-3 py-1.5 border font-sans text-xs transition-colors",
                        params.color === color ? ACTIVE_CHIP : INACTIVE_CHIP
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
