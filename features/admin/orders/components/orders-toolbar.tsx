"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/generated/prisma/client";
import { useOrdersParams } from "../hooks/use-orders-params";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

type OrdersToolbarProps = {
  total: number;
};

export function OrdersToolbar({ total }: OrdersToolbarProps) {
  const [params, setParams] = useOrdersParams();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParams({ search: e.target.value || null, page: 1 });
    },
    [setParams],
  );

  const handleStatus = (value: string) => {
    setParams({ status: value === "ALL" ? null : (value as OrderStatus), page: 1 });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <Input
          placeholder="Search by order ID or customer…"
          value={params.search ?? ""}
          onChange={handleSearch}
          className="max-w-xs"
        />
        <Select
          value={params.status ?? "ALL"}
          onValueChange={handleStatus}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {Object.values(OrderStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {total} order{total !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
