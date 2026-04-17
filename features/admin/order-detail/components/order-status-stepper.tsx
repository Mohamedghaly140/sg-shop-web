import { LucideCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/generated/prisma/client";

const HAPPY_PATH: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const STEP_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const TERMINAL_BADGE_CLASS: Record<string, string> = {
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-orange-100 text-orange-800 border-orange-200",
};

type OrderStatusStepperProps = {
  status: OrderStatus;
};

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const isTerminal = status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED;

  if (isTerminal) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Order status:</span>
        <Badge
          variant="outline"
          className={cn("text-sm font-medium", TERMINAL_BADGE_CLASS[status])}
        >
          {STEP_LABELS[status]}
        </Badge>
      </div>
    );
  }

  const currentIndex = HAPPY_PATH.indexOf(status);

  return (
    <div className="flex items-center w-full">
      {HAPPY_PATH.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <LucideCheck className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {index < HAPPY_PATH.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 mb-5 rounded",
                  index < currentIndex ? "bg-primary" : "bg-muted-foreground/20",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
