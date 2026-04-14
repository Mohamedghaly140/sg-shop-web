import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { TopProduct } from "../types";

type Props = {
  products: TopProduct[];
};

export function TopProductsTable({ products }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-sans font-semibold">Top Products by Revenue</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {products.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No sales data yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="max-w-[120px] truncate text-sm hover:underline"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.categoryName}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {product.units.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    EGP{" "}
                    {product.revenue.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
