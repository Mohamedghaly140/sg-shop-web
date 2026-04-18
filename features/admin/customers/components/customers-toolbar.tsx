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
import { useCustomersParams } from "../hooks/use-customers-params";

type CustomersToolbarProps = {
  total: number;
};

export function CustomersToolbar({ total }: CustomersToolbarProps) {
  const [params, setParams] = useCustomersParams();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParams({ search: e.target.value || null, page: 1 });
    },
    [setParams]
  );

  const handleActive = useCallback(
    (value: string) => {
      setParams({
        active: value === "ALL" ? null : value === "true",
        page: 1,
      });
    },
    [setParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <Input
          placeholder="Search by name, email or phone…"
          value={params.search ?? ""}
          onChange={handleSearch}
          className="max-w-xs"
        />
        <Select
          value={params.active === null || params.active === undefined ? "ALL" : String(params.active)}
          onValueChange={handleActive}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {total} customer{total !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
