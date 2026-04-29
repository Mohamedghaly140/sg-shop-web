import { notFound } from "next/navigation";
import { getProductDetail } from "@/features/product-detail/services/get-product-detail";
import ProductDetailFeature from "@/features/product-detail";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) return {};
  return {
    title: `${product.name} | SG Couture`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) notFound();
  return <ProductDetailFeature product={product} />;
}
