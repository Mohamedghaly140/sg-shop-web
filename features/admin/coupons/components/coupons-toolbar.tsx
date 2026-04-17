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
import { useCouponsParams } from "../hooks/use-coupons-params";
import { UpsertCouponDialog } from "./upsert-coupon-dialog";

type CouponsToolbarProps = {
  total: number;
};

export function CouponsToolbar({ total }: CouponsToolbarProps) {
  const [params, setParams] = useCouponsParams();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParams({ search: e.target.value || null, page: 1 });
    },
    [setParams]
  );

  const handleStatus = useCallback(
    (value: string) => {
      setParams({
        status:
          value === "ALL"
            ? null
            : (value as "active" | "expired" | "exhausted"),
        page: 1,
      });
    },
    [setParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <Input
          placeholder="Search by code…"
          value={params.search ?? ""}
          onChange={handleSearch}
          className="max-w-xs"
        />
        <Select value={params.status ?? "ALL"} onValueChange={handleStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="exhausted">Exhausted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {total} coupon{total !== 1 ? "s" : ""}
        </span>
        <UpsertCouponDialog mode="create" />
      </div>
    </div>
  );
}
