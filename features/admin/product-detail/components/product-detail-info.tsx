import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductDetail } from "../services/get-product-detail";

type ProductDetailInfoProps = {
  product: ProductDetail;
};

function money(value: string) {
  const n = Number(value);
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  const hasDiscount = Number(product.discount) > 0;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="pricing">Pricing & stock</TabsTrigger>
        <TabsTrigger value="variants">Variants</TabsTrigger>
        <TabsTrigger value="meta">Meta</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Category" value={product.category.name} />
            <Separator />
            <Row
              label="Brand"
              value={product.brand?.name ?? <span className="text-muted-foreground">—</span>}
            />
            <Separator />
            <Row
              label="Sub-categories"
              value={
                product.subCategories.length === 0 ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <div className="flex flex-wrap justify-end gap-1">
                    {product.subCategories.map((s) => (
                      <Badge key={s.id} variant="secondary" className="font-normal">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                )
              }
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pricing" className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <Row label="Price" value={money(product.price)} />
            <Separator />
            <Row
              label="Discount"
              value={hasDiscount ? `${Number(product.discount)}%` : "—"}
            />
            <Separator />
            <Row
              label="After discount"
              value={hasDiscount ? money(product.priceAfterDiscount) : money(product.price)}
            />
            <Separator />
            <Row
              label="In stock"
              value={
                <span
                  className={product.quantity === 0 ? "text-destructive" : undefined}
                >
                  {product.quantity} {product.quantity === 1 ? "unit" : "units"}
                </span>
              }
            />
            <Separator />
            <Row label="Sold" value={product.sold} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="variants" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            {product.sizes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sizes defined</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <Badge key={s} variant="outline" className="font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Colors</CardTitle>
          </CardHeader>
          <CardContent>
            {product.colors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No colors defined</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {product.colors.map((c) => (
                  <Badge key={c} variant="outline" className="font-normal">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="meta" className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <Row label="Product ID" value={<code className="text-xs">{product.id}</code>} />
            <Separator />
            <Row label="Slug" value={<code className="text-xs">{product.slug}</code>} />
            <Separator />
            <Row
              label="Rating"
              value={
                product.ratingsAverage
                  ? `${product.ratingsAverage} (${product.ratingsQuantity})`
                  : "—"
              }
            />
            <Separator />
            <Row
              label="Created"
              value={format(product.createdAt, "MMM d, yyyy · HH:mm")}
            />
            <Separator />
            <Row
              label="Updated"
              value={format(product.updatedAt, "MMM d, yyyy · HH:mm")}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
