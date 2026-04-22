"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  LucideArchive,
  LucideArchiveRestore,
  LucideCopy,
  LucidePencil,
  LucideStar,
  LucideStarOff,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProductStatus } from "@/generated/prisma/enums";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { duplicateProductAction } from "@/features/admin/products/actions/duplicateProduct";
import { toggleFeaturedAction } from "@/features/admin/products/actions/toggleFeatured";
import { updateProductStatusAction } from "@/features/admin/products/actions/updateProductStatus";
import { DeleteProductButton } from "@/features/admin/products/components/delete-product-button";
import { ProductStatusBadge } from "@/features/admin/products/components/status-badge";

type ProductDetailHeaderProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    status: ProductStatus;
    featured: boolean;
  };
};

export function ProductDetailHeader({ product }: ProductDetailHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (fd: FormData, action: typeof updateProductStatusAction) => {
    startTransition(async () => {
      const res = await action(EMPTY_ACTION_STATE, fd);
      if (res.status === "SUCCESS") toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });
  };

  const toggleArchive = () => {
    const next =
      product.status === ProductStatus.ARCHIVED
        ? ProductStatus.ACTIVE
        : ProductStatus.ARCHIVED;
    const fd = new FormData();
    fd.append("productId", product.id);
    fd.append("status", next);
    run(fd, updateProductStatusAction);
  };

  const toggleFeatured = () => {
    const fd = new FormData();
    fd.append("productId", product.id);
    fd.append("featured", (!product.featured).toString());
    run(fd, toggleFeaturedAction);
  };

  const duplicate = () => {
    const fd = new FormData();
    fd.append("productId", product.id);
    startTransition(async () => {
      const res = await duplicateProductAction(EMPTY_ACTION_STATE, fd);
      if (res.status === "SUCCESS") {
        toast.success(res.message);
        const id = res.response?.id;
        if (typeof id === "string") router.push(`/admin/products/${id}/edit`);
      } else if (res.message) {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <ProductStatusBadge status={product.status} />
          {product.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <LucideStar className="size-3 fill-current" /> Featured
            </span>
          )}
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          /{product.slug}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={duplicate}
          disabled={isPending}
        >
          <LucideCopy className="size-4" /> Duplicate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFeatured}
          disabled={isPending}
        >
          {product.featured ? (
            <>
              <LucideStarOff className="size-4" /> Unfeature
            </>
          ) : (
            <>
              <LucideStar className="size-4" /> Feature
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleArchive}
          disabled={isPending}
        >
          {product.status === ProductStatus.ARCHIVED ? (
            <>
              <LucideArchiveRestore className="size-4" /> Activate
            </>
          ) : (
            <>
              <LucideArchive className="size-4" /> Archive
            </>
          )}
        </Button>
        <DeleteProductButton
          productId={product.id}
          productName={product.name}
          trigger={
            <Button variant="outline" size="sm" className="text-destructive">
              Delete
            </Button>
          }
          onDeleted={() => router.push("/admin/products")}
        />
        <Button size="sm" asChild>
          <Link href={`/admin/products/${product.id}/edit`}>
            <LucidePencil className="size-4" /> Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}
