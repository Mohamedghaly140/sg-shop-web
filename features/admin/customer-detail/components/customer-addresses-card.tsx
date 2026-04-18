import { LucideMapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerDetail } from "../services/get-customer";

type CustomerAddressesCardProps = {
  addresses: CustomerDetail["addresses"];
};

export function CustomerAddressesCard({ addresses }: CustomerAddressesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Saved Addresses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <LucideMapPin className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No saved addresses</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-md border p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{address.alias}</span>
                  {address.isDefault && (
                    <Badge variant="outline" className="text-xs border-blue-500/30 bg-blue-500/10 text-blue-400">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {address.addressLine1}, {address.area}, {address.city}, {address.governorate}, {address.country}
                </p>
                <p className="text-xs text-muted-foreground">{address.phone}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
