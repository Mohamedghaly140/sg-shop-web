import { LucideMapPin, LucidePhone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderDetail } from "../services/get-order";

type OrderShippingCardProps = {
  order: Pick<
    OrderDetail,
    | "shippingAddress"
    | "anonCountry"
    | "anonGovernorate"
    | "anonCity"
    | "anonArea"
    | "anonAddressLine1"
    | "anonDetails"
    | "anonPostalCode"
    | "anonShippingPhone"
  >;
};

export function OrderShippingCard({ order }: OrderShippingCardProps) {
  const addr = order.shippingAddress;

  const country = addr?.country ?? order.anonCountry;
  const governorate = addr?.governorate ?? order.anonGovernorate;
  const city = addr?.city ?? order.anonCity;
  const area = addr?.area ?? order.anonArea;
  const line1 = addr?.addressLine1 ?? order.anonAddressLine1;
  const details = addr?.details ?? order.anonDetails;
  const postalCode = addr?.postalCode ?? order.anonPostalCode;
  const phone = addr?.phone ?? order.anonShippingPhone;

  const hasAddress = country || governorate || city || area || line1;

  if (!hasAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No address provided</p>
        </CardContent>
      </Card>
    );
  }

  const addressParts = [line1, area, city, governorate, country]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Shipping Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <LucideMapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p>{addressParts}</p>
            {details && <p className="text-muted-foreground">{details}</p>}
            {postalCode && <p className="text-muted-foreground">Postal: {postalCode}</p>}
          </div>
        </div>
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
