import { ImageGallery } from "./components/ImageGallery";
import { ProductInfo } from "./components/ProductInfo";
import type { ProductDetailData } from "./services/get-product-detail";

type ProductDetailFeatureProps = {
  product: ProductDetailData;
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
          id={product.id}
          name={product.name}
          description={product.description}
          price={product.price.toString()}
          discount={product.discount.toString()}
          priceAfterDiscount={product.priceAfterDiscount.toString()}
          sizes={product.sizes}
          colors={product.colors}
          quantity={product.quantity}
          categoryName={product.category.name}
          categorySlug={product.category.slug}
          inWishlist={product.inWishlist}
        />
      </div>
    </div>
  );
}
