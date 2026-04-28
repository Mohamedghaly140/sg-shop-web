import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCustomer } from "./services/get-customer";
import { CustomerProfileCard } from "./components/customer-profile-card";
import { CustomerStatsCard } from "./components/customer-stats-card";
import { CustomerAddressesCard } from "./components/customer-addresses-card";
import { CustomerOrdersTable } from "./components/customer-orders-table";
import { ToggleCustomerActiveButton } from "../customers/components/toggle-customer-active-button";

type AdminCustomerDetailFeatureProps = {
  id: string;
};

export default async function AdminCustomerDetailFeature({ id }: AdminCustomerDetailFeatureProps) {
  const [customer, { userId: currentUserId }] = await Promise.all([
    getCustomer(id),
    auth(),
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/customers">
            <LucideArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{customer.name}</h1>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                customer.active
                  ? "border-green-500/30 bg-green-500/10 text-green-500"
                  : "border-red-500/30 bg-red-500/10 text-red-500"
              )}
            >
              {customer.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{customer.email}</p>
        </div>
        {customer.id !== currentUserId && (
          <ToggleCustomerActiveButton
            customerId={customer.id}
            active={customer.active}
          />
        )}
      </div>

      {/* Stats */}
      <CustomerStatsCard customer={customer} />

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2">
          <CustomerOrdersTable orders={customer.orders} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <CustomerProfileCard customer={customer} />
          <CustomerAddressesCard addresses={customer.addresses} />
        </div>
      </div>
    </div>
  );
}
