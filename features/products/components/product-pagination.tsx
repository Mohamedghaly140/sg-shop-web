"use client";

import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductParams } from "../hooks/use-product-params";

type ProductPaginationProps = {
  page: number;
  pageCount: number;
};

const MAX_VISIBLE_PAGES = 7;

function getPageNumbers(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [];
  const half = Math.floor(MAX_VISIBLE_PAGES / 2);

  if (page <= half + 1) {
    for (let i = 1; i <= MAX_VISIBLE_PAGES - 2; i++) pages.push(i);
    pages.push("…");
    pages.push(pageCount);
  } else if (page >= pageCount - half) {
    pages.push(1);
    pages.push("…");
    for (let i = pageCount - (MAX_VISIBLE_PAGES - 3); i <= pageCount; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    pages.push("…");
    for (let i = page - (half - 2); i <= page + (half - 2); i++) {
      pages.push(i);
    }
    pages.push("…");
    pages.push(pageCount);
  }

  return pages;
}

export function ProductPagination({ page, pageCount }: ProductPaginationProps) {
  const [, setParams] = useProductParams();

  if (pageCount <= 1) return null;

  const pageNumbers = getPageNumbers(page, pageCount);

  function handlePrev() {
    setParams({ page: page - 1 });
  }

  function handleNext() {
    setParams({ page: page + 1 });
  }

  function handlePageClick(p: number) {
    setParams({ page: p });
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-12 border-t border-border">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-none"
        onClick={handlePrev}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <LucideChevronLeft className="size-4" />
      </Button>

      {pageNumbers.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-8 w-8 items-center justify-center font-sans text-xs text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => handlePageClick(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex h-8 w-8 items-center justify-center border font-sans text-xs transition-colors",
              p === page
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {p}
          </button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-none"
        onClick={handleNext}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <LucideChevronRight className="size-4" />
      </Button>
    </div>
  );
}
