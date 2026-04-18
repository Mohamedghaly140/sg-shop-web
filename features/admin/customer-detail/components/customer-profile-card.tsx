import { format } from "date-fns";
import { LucideCalendar, LucideMail, LucidePhone, LucideUser } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CustomerDetail } from "../services/get-customer";

type CustomerProfileCardProps = {
  customer: Pick<CustomerDetail, "name" | "email" | "phone" | "active" | "createdAt">;
};

export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <LucideUser className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">{customer.name}</span>
          <Badge
            variant="outline"
            className={cn(
              "ml-auto text-xs",
              customer.active
                ? "border-green-500/30 bg-green-500/10 text-green-500"
                : "border-red-500/30 bg-red-500/10 text-red-500"
            )}
          >
            {customer.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <LucideMail className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">{customer.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <LucidePhone className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">{customer.phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <LucideCalendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">
            Joined {format(customer.createdAt, "MMM d, yyyy")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
