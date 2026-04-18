import Link from "next/link";
import { LucideChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getProductFormData } from "./services/get-product-form-data";
import { getProductById } from "./services/get-product-by-id";
import { ProductForm } from "./components/product-form";

type AdminProductFormFeatureProps = {
  mode: "create" | "edit";
  productId?: string;
};

export default async function AdminProductFormFeature({
  mode,
  productId,
}: AdminProductFormFeatureProps) {
  const [formData, product] = await Promise.all([
    getProductFormData(),
    mode === "edit" && productId ? getProductById(productId) : Promise.resolve(undefined),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link
            href={
              mode === "edit" && product
                ? `/admin/products/${product.id}`
                : "/admin/products"
            }
          >
            <LucideChevronLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "New product" : `Edit · ${product?.name}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Add a new product to your catalog"
              : "Update pricing, inventory, images, and status"}
          </p>
        </div>
      </div>

      <ProductForm mode={mode} formData={formData} product={product} />
    </div>
  );
}
