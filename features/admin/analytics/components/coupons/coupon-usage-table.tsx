import { format, isPast } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { CouponRow } from "../../types";

function fmtEGP(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

type CouponUsageTableProps = { coupons: CouponRow[] };

export function CouponUsageTable({ coupons }: CouponUsageTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Coupon</TableHead>
          <TableHead className="text-right">Discount</TableHead>
          <TableHead className="text-right">Used / Max</TableHead>
          <TableHead className="text-right">Period Redemptions</TableHead>
          <TableHead className="text-right">Discount Given</TableHead>
          <TableHead>Expires</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
              No coupons found
            </TableCell>
          </TableRow>
        )}
        {coupons.map((coupon) => {
          const expired = isPast(new Date(coupon.expire));
          return (
            <TableRow key={coupon.id}>
              <TableCell className="font-medium">{coupon.name}</TableCell>
              <TableCell className="text-right">{coupon.discountPct}%</TableCell>
              <TableCell className="text-right">
                {coupon.usedCount} / {coupon.maxUsage === 0 ? "∞" : coupon.maxUsage}
              </TableCell>
              <TableCell className="text-right">{coupon.periodRedemptions}</TableCell>
              <TableCell className="text-right">{fmtEGP(coupon.totalDiscountGiven)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(coupon.expire), "MMM d, yyyy")}
                  </span>
                  {expired && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
