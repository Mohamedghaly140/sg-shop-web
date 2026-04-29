import { ImageGallery } from "./components/ImageGallery";
import { ProductInfo } from "./components/ProductInfo";
import type { ProductDetailData } from "./services/get-product-detail";
import type { DecimalToString } from "@/types/utils";

type SerializedProduct = DecimalToString<
  ProductDetailData,
  "price" | "discount" | "priceAfterDiscount"
>;

type ProductDetailFeatureProps = {
  product: SerializedProduct;
};

export default function ProductDetailFeature({
  product,
}: ProductDetailFeatureProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left — Image gallery */}
        <ImageGallery
          primaryImageUrl={product.imageUrl}
          additionalImages={
            product.images.filter(img => img.imageUrl != null) as {
              imageUrl: string;
            }[]
          }
          productName={product.name}
        />

        {/* Right — Product info */}
        <ProductInfo
          name={product.name}
          description={product.description}
          price={product.price}
          discount={product.discount}
          priceAfterDiscount={product.priceAfterDiscount}
          sizes={product.sizes}
          colors={product.colors}
          quantity={product.quantity}
          categoryName={product.category.name}
          inWishlist={product.inWishlist}
        />
      </div>
    </div>
  );
}
