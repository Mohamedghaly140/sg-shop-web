import { Badge } from "@/components/ui/badge";
import { ProductStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const STYLES: Record<ProductStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border",
  ACTIVE:
    "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20",
  ARCHIVED:
    "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20",
};

const LABELS: Record<ProductStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  return (
    <Badge className={cn("font-normal capitalize", STYLES[status], className)}>
      {LABELS[status]}
    </Badge>
  );
}
