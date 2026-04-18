"use client";

import { useState, useRef } from "react";
import { LucideX } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ChipInputProps = {
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function ChipInput({
  name,
  value,
  onChange,
  placeholder = "Type and press Enter…",
  className,
}: ChipInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...value, v]);
    setDraft("");
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/50"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((item, i) => (
          <Badge
            key={`${item}-${i}`}
            variant="secondary"
            className="gap-1 pr-0.5"
          >
            {item}
            <button
              type="button"
              className="ml-1 rounded-sm opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                remove(i);
              }}
              aria-label={`Remove ${item}`}
            >
              <LucideX className="size-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              remove(value.length - 1);
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="h-7 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      {value.map((v, i) => (
        <input key={`${name}-${i}`} type="hidden" name={name} value={v} />
      ))}
    </div>
  );
}
