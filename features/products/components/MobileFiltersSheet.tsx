"use client";

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
import { useProductParams } from "../hooks/useProductParams";

type MobileFiltersSheetProps = {
  options: FilterOptions;
  activeCount: number;
};

const ACTIVE_CHIP =
  "border-foreground text-foreground bg-[oklch(0.96_0.008_85)]";
const INACTIVE_CHIP =
  "border-border text-muted-foreground hover:border-foreground hover:text-foreground";

export function MobileFiltersSheet({
  options,
  activeCount,
}: MobileFiltersSheetProps) {
  const [params, setParams] = useProductParams();

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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 lg:hidden rounded-none">
          <LucideSlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center bg-foreground px-1.5 text-[0.625rem] font-medium text-background">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-none px-0">
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-4 pb-4 pt-0">
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
                  defaultValue={params.minPrice > 0 ? params.minPrice : ""}
                  onBlur={handleMinPriceBlur}
                  className="h-9 text-sm rounded-none"
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
      </SheetContent>
    </Sheet>
  );
}
