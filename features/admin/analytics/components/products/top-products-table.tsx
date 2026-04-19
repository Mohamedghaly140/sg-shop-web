import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { TopProduct } from "../../types";

function fmtEGP(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

type TopProductsTableProps = { data: TopProduct[] };

export function TopProductsTable({ data }: TopProductsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead className="text-right">Units Sold</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
              No sales data for this period
            </TableCell>
          </TableRow>
        )}
        {data.map((product, i) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium text-muted-foreground">
              {i + 1}
            </TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell className="text-muted-foreground">{product.categoryName}</TableCell>
            <TableCell className="text-muted-foreground">
              {product.brandName ?? "—"}
            </TableCell>
            <TableCell className="text-right">{product.sold.toLocaleString("en-US")}</TableCell>
            <TableCell className="text-right">{fmtEGP(product.revenue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
