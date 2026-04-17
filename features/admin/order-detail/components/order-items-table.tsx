import Image from "next/image";
import { LucidePackage } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderDetail } from "../services/get-order";

type OrderItemsTableProps = {
  items: OrderDetail["items"];
};

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Order Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right pr-6">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const unitPrice = item.price ? Number(item.price) : null;
              const subtotal = unitPrice != null ? unitPrice * item.quantity : null;

              return (
                <TableRow key={item.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="size-10 rounded-md border object-cover bg-muted flex-shrink-0"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-md border bg-muted flex-shrink-0">
                          <LucidePackage className="size-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {item.color && <span>Color: {item.color}</span>}
                      {item.size && <span>Size: {item.size}</span>}
                      {!item.color && !item.size && <span>—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {unitPrice != null ? `EGP ${unitPrice.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium pr-6">
                    {subtotal != null ? `EGP ${subtotal.toFixed(2)}` : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
