import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { LowStockProduct } from "../types";

type Props = {
  products: LowStockProduct[];
};

export function LowStockAlerts({ products }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans font-semibold">Low Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.categoryName}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "tabular-nums",
                    product.quantity === 0
                      ? "border-red-500/30 bg-red-500/10 text-red-500"
                      : product.quantity < 5
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
                  )}
                >
                  {product.quantity} left
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
