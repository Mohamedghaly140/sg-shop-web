"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useCategoriesParams } from "../hooks/use-categories-params";
import { UpsertCategoryDialog } from "./upsert-category-dialog";

type CategoriesToolbarProps = {
  total: number;
};

export function CategoriesToolbar({ total }: CategoriesToolbarProps) {
  const [params, setParams] = useCategoriesParams();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParams({ search: e.target.value || null, page: 1 });
    },
    [setParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <Input
          placeholder="Search by name or slug…"
          value={params.search ?? ""}
          onChange={handleSearch}
          className="max-w-xs"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {total} categor{total !== 1 ? "ies" : "y"}
        </span>
        <UpsertCategoryDialog mode="create" />
      </div>
    </div>
  );
}
