"use client";

import { LucideCheck, LucideChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type SubCategory = { id: string; name: string; categoryId: string };

type SubcategoriesMultiselectProps = {
  name: string;
  categoryId: string | null;
  allSubCategories: SubCategory[];
  value: string[];
  onChange: (next: string[]) => void;
};

export function SubcategoriesMultiselect({
  name,
  categoryId,
  allSubCategories,
  value,
  onChange,
}: SubcategoriesMultiselectProps) {
  const [open, setOpen] = useState(false);

  const available = useMemo(
    () =>
      categoryId
        ? allSubCategories.filter((s) => s.categoryId === categoryId)
        : allSubCategories,
    [allSubCategories, categoryId],
  );

  const byId = useMemo(
    () => new Map(allSubCategories.map((s) => [s.id, s])),
    [allSubCategories],
  );

  const selected = value.map((id) => byId.get(id)).filter(Boolean) as SubCategory[];

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal"
            disabled={!categoryId}
          >
            <span className="truncate text-left">
              {!categoryId
                ? "Select a category first"
                : selected.length === 0
                  ? "Select sub-categories"
                  : `${selected.length} selected`}
            </span>
            <LucideChevronsUpDown className="ml-2 size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder="Search sub-categories…" />
            <CommandList>
              <CommandEmpty>No sub-categories.</CommandEmpty>
              <CommandGroup>
                {available.map((s) => {
                  const isSelected = value.includes(s.id);
                  return (
                    <CommandItem
                      key={s.id}
                      value={s.name}
                      onSelect={() => toggle(s.id)}
                    >
                      <LucideCheck
                        className={cn(
                          "size-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {s.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((s) => (
            <Badge key={s.id} variant="secondary" className="font-normal">
              {s.name}
            </Badge>
          ))}
        </div>
      )}

      {value.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
