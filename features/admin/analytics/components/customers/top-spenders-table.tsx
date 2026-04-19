import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { TopSpender } from "../../types";

function fmtEGP(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

type TopSpendersTableProps = { data: TopSpender[] };

export function TopSpendersTable({ data }: TopSpendersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Orders</TableHead>
          <TableHead className="text-right">Total Spent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
              No customer orders in this period
            </TableCell>
          </TableRow>
        )}
        {data.map((spender, i) => (
          <TableRow key={spender.id}>
            <TableCell className="font-medium text-muted-foreground">
              {i + 1}
            </TableCell>
            <TableCell className="font-medium">{spender.name}</TableCell>
            <TableCell className="text-muted-foreground">{spender.email}</TableCell>
            <TableCell className="text-right">{spender.ordersCount}</TableCell>
            <TableCell className="text-right">{fmtEGP(spender.totalSpent)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
