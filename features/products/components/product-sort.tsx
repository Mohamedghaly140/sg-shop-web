"use client";

import { LucideLayoutGrid, LucideLayoutList } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProductParams } from "../hooks/use-product-params";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "best_rated", label: "Best Rated" },
  { value: "most_sold", label: "Most Popular" },
] as const;

export function ProductSort() {
  const [params, setParams] = useProductParams();

  function handleSortChange(sort: string) {
    setParams({ sort: sort as typeof params.sort, page: 1 });
  }

  function handleGridView() {
    setParams({ view: "grid" });
  }

  function handleListView() {
    setParams({ view: "list" });
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={params.sort} onValueChange={handleSortChange}>
        <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs rounded-none focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex border border-border">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-none",
            params.view === "grid" && "bg-foreground text-background hover:bg-foreground hover:text-background"
          )}
          onClick={handleGridView}
          aria-label="Grid view"
        >
          <LucideLayoutGrid className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-none border-l border-border",
            params.view === "list" && "bg-foreground text-background hover:bg-foreground hover:text-background"
          )}
          onClick={handleListView}
          aria-label="List view"
        >
          <LucideLayoutList className="size-4" />
        </Button>
      </div>
    </div>
  );
}
