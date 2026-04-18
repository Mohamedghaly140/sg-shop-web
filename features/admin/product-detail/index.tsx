import Link from "next/link";
import { LucideChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getProductDetail } from "./services/get-product-detail";
import { ProductDetailGallery } from "./components/product-detail-gallery";
import { ProductDetailHeader } from "./components/product-detail-header";
import { ProductDetailInfo } from "./components/product-detail-info";

type AdminProductDetailFeatureProps = {
  productId: string;
};

export default async function AdminProductDetailFeature({
  productId,
}: AdminProductDetailFeatureProps) {
  const product = await getProductDetail(productId);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <LucideChevronLeft className="size-5" />
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Products / <span className="text-foreground">{product.name}</span>
        </span>
      </div>

      <ProductDetailHeader product={product} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <ProductDetailGallery
          mainImageUrl={product.imageUrl}
          galleryImages={product.images}
          alt={product.name}
        />
        <ProductDetailInfo product={product} />
      </div>
    </div>
  );
}
