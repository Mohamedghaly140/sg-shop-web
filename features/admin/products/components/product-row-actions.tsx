"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  LucideArchive,
  LucideArchiveRestore,
  LucideCopy,
  LucideEye,
  LucideMoreHorizontal,
  LucidePencil,
  LucideStar,
  LucideStarOff,
  LucideTrash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductStatus } from "@/generated/prisma/enums";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { duplicateProductAction } from "../actions/duplicateProduct";
import { toggleFeaturedAction } from "../actions/toggleFeatured";
import { updateProductStatusAction } from "../actions/updateProductStatus";
import { DeleteProductButton } from "./delete-product-button";

type ProductRowActionsProps = {
  product: {
    id: string;
    name: string;
    status: ProductStatus;
    featured: boolean;
  };
};

export function ProductRowActions({ product }: ProductRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const runAction = (
    action: (
      state: typeof EMPTY_ACTION_STATE,
      data: FormData,
    ) => Promise<typeof EMPTY_ACTION_STATE>,
    formData: FormData,
  ) => {
    startTransition(async () => {
      const res = await action(EMPTY_ACTION_STATE, formData);
      if (res.status === "SUCCESS") toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });
  };

  const setStatus = (status: ProductStatus) => {
    const fd = new FormData();
    fd.append("productId", product.id);
    fd.append("status", status);
    runAction(updateProductStatusAction, fd);
  };

  const toggleFeatured = () => {
    const fd = new FormData();
    fd.append("productId", product.id);
    fd.append("featured", (!product.featured).toString());
    runAction(toggleFeaturedAction, fd);
  };

  const duplicate = () => {
    const fd = new FormData();
    fd.append("productId", product.id);
    runAction(duplicateProductAction, fd);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <LucideMoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${product.id}`}>
            <LucideEye className="size-4" /> View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${product.id}/edit`}>
            <LucidePencil className="size-4" /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={duplicate}>
          <LucideCopy className="size-4" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={toggleFeatured}>
          {product.featured ? (
            <>
              <LucideStarOff className="size-4" /> Unfeature
            </>
          ) : (
            <>
              <LucideStar className="size-4" /> Feature
            </>
          )}
        </DropdownMenuItem>
        {product.status === ProductStatus.ARCHIVED ? (
          <DropdownMenuItem onSelect={() => setStatus(ProductStatus.ACTIVE)}>
            <LucideArchiveRestore className="size-4" /> Activate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => setStatus(ProductStatus.ARCHIVED)}>
            <LucideArchive className="size-4" /> Archive
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DeleteProductButton
          productId={product.id}
          productName={product.name}
          trigger={
            <DropdownMenuItem
              variant="destructive"
              onSelect={e => e.preventDefault()}
            >
              <LucideTrash2 className="size-4" /> Delete
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
