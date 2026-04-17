import { LucideUser, LucideMail, LucidePhone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OrderDetail } from "../services/get-order";

type OrderCustomerCardProps = {
  order: Pick<OrderDetail, "user" | "anonName" | "anonEmail" | "anonPhone">;
};

export function OrderCustomerCard({ order }: OrderCustomerCardProps) {
  const isRegistered = !!order.user;
  const name = order.user?.name ?? order.anonName ?? "Guest";
  const email = order.user?.email ?? order.anonEmail;
  const phone = order.user?.phone ?? order.anonPhone;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Customer</CardTitle>
          <Badge variant="outline" className="text-xs">
            {isRegistered ? "Registered" : "Guest"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <LucideUser className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium">{name}</span>
        </div>
        {email && (
          <div className="flex items-center gap-2 text-sm">
            <LucideMail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground break-all">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-sm">
            <LucidePhone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{phone}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
