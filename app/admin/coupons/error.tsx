"use client";

import { useEffect } from "react";
import { LucideAlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminCouponsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminCouponsError({ error, reset }: AdminCouponsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <LucideAlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">Failed to load coupons</p>
        <p className="text-sm text-muted-foreground">
          {error.message || "Something went wrong. Please try again."}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
