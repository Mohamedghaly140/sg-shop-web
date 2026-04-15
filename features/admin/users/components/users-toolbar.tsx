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
import { useUsersParams } from "../hooks/use-users-params";
import { UpsertUserDialog } from "./upsert-user-dialog";

type UsersToolbarProps = {
  total: number;
};

export function UsersToolbar({ total }: UsersToolbarProps) {
  const [params, setParams] = useUsersParams();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParams({ search: e.target.value || null, page: 1 });
    },
    [setParams]
  );

  const handleRole = (value: string) => {
    setParams({
      role: (value === "ALL" ? null : value) as "USER" | "MANAGER" | "ADMIN" | null,
      page: 1,
    });
  };

  const handleActive = (value: string) => {
    setParams({
      active: (value === "ALL" ? null : value) as "true" | "false" | null,
      page: 1,
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <Input
          placeholder="Search by name or email…"
          defaultValue={params.search ?? ""}
          onChange={handleSearch}
          className="max-w-xs"
        />
        <Select
          value={params.role ?? "ALL"}
          onValueChange={handleRole}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={params.active ?? "ALL"}
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
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {total} user{total !== 1 ? "s" : ""}
        </span>
        <UpsertUserDialog mode="create" />
      </div>
    </div>
  );
}
