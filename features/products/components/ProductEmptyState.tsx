"use client";

import { LucidePackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProductParams } from "../hooks/useProductParams";

export function ProductEmptyState() {
  const [, setParams] = useProductParams();

  function handleClearFilters() {
    setParams({
      category: "",
      brand: "",
      minPrice: 0,
      maxPrice: 0,
      size: "",
      color: "",
      sort: "newest",
      page: 1,
    });
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <LucidePackageSearch className="size-10 text-muted-foreground mb-6" />
      <p className="font-heading text-2xl text-foreground mb-2">
        No products found
      </p>
      <p className="font-sans text-sm text-muted-foreground mb-8">
        No products match your current filters.
      </p>
      <Button variant="outline" onClick={handleClearFilters} className="rounded-none">
        Clear filters
      </Button>
    </div>
  );
}
