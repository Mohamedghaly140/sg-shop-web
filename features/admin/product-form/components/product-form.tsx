"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { LucideLoader2, LucideSave, LucideTrash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CloudinaryUploader,
  type UploadedImage,
} from "@/components/shared/cloudinary-uploader";
import Form from "@/components/shared/form/form";
import SubmitButton from "@/components/shared/submit-button";
import FieldError from "@/components/shared/form/field-error";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { CLOUDINARY_PRODUCTS_FOLDER } from "@/lib/cloudinary-public";
import { ProductStatus } from "@/generated/prisma/enums";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/features/admin/products/actions/products.actions";
import type { ProductFormData } from "../services/get-product-form-data";
import type { ProductForForm } from "../services/get-product-by-id";
import { SectionCard } from "./section-card";
import { ChipInput } from "./chip-input";
import { SubcategoriesMultiselect } from "./subcategories-multiselect";
import {
  ProductImagesManager,
  type GalleryImage,
} from "./product-images-manager";

type ProductFormProps = {
  mode: "create" | "edit";
  formData: ProductFormData;
  product?: ProductForForm;
};

export function ProductForm({ mode, formData, product }: ProductFormProps) {
  const router = useRouter();

  const [actionState, submitAction] = useActionState(
    mode === "create" ? createProductAction : updateProductAction,
    EMPTY_ACTION_STATE,
  );

  const [mainImage, setMainImage] = useState<UploadedImage | null>(
    product ? { imageId: product.imageId, imageUrl: product.imageUrl } : null,
  );
  const [gallery, setGallery] = useState<GalleryImage[]>(
    product?.images.map(img => ({
      imageId: img.imageId,
      imageUrl: img.imageUrl,
      productImageId: img.id,
    })) ?? [],
  );
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);
  const [categoryId, setCategoryId] = useState<string>(
    product?.categoryId ?? "",
  );
  const [brandId, setBrandId] = useState<string>(
    product?.brandId ?? "__NONE__",
  );
  const [subCategoryIds, setSubCategoryIds] = useState<string[]>(
    product?.subCategoryIds ?? [],
  );
  const [status, setStatus] = useState<ProductStatus>(
    (product?.status as ProductStatus) ?? ProductStatus.DRAFT,
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [price, setPrice] = useState<string>(product?.price ?? "");
  const [discount, setDiscount] = useState<string>(product?.discount ?? "0");
  const [isDeleting, setIsDeleting] = useState(false);

  const priceAfter =
    price && /^\d+(\.\d+)?$/.test(price)
      ? (Number(price) * (1 - Number(discount || 0) / 100)).toFixed(2)
      : "—";

  const handleDelete = async () => {
    if (!product) return;
    const ok = window.confirm(
      `Delete "${product.name}"? All images will be removed. This cannot be undone.`,
    );
    if (!ok) return;
    setIsDeleting(true);
    const fd = new FormData();
    fd.append("productId", product.id);
    const res = await deleteProductAction(EMPTY_ACTION_STATE, fd);
    setIsDeleting(false);
    if (res.status === "SUCCESS") {
      toast.success(res.message);
      router.push("/admin/products");
    } else if (res.message) {
      toast.error(res.message);
    }
  };

  return (
    <Form
      action={submitAction}
      actionState={actionState}
      onSuccess={state => {
        const id = state.response?.id;
        if (typeof id === "string") {
          router.push(`/admin/products/${id}`);
        }
      }}
    >
      {product && <input type="hidden" name="productId" value={product.id} />}
      {mainImage && (
        <>
          <input type="hidden" name="imageId" value={mainImage.imageId} />
          <input type="hidden" name="imageUrl" value={mainImage.imageUrl} />
        </>
      )}
      <input type="hidden" name="status" value={status} />
      {featured && <input type="hidden" name="featured" value="on" />}
      <input
        type="hidden"
        name="brandId"
        value={brandId === "__NONE__" ? "" : brandId}
      />
      <input type="hidden" name="categoryId" value={categoryId} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Basics" description="Name, slug, and description">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Classic Linen Shirt"
                defaultValue={actionState.payload?.name ?? product?.name ?? ""}
                required
              />
              <FieldError name="name" actionState={actionState} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe materials, fit, and key selling points…"
                defaultValue={
                  actionState.payload?.description ?? product?.description ?? ""
                }
                required
              />
              <FieldError name="description" actionState={actionState} />
            </div>
          </SectionCard>

          <SectionCard
            title="Pricing & inventory"
            description="Set price, discount, and available stock"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
                <FieldError name="price" actionState={actionState} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                />
                <FieldError name="discount" actionState={actionState} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>After discount</Label>
                <Input value={priceAfter} disabled readOnly />
                <p className="text-xs text-muted-foreground">Auto-calculated</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 max-w-xs">
              <Label htmlFor="quantity">Quantity in stock</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                defaultValue={
                  actionState.payload?.quantity ??
                  product?.quantity.toString() ??
                  "0"
                }
                required
              />
              <FieldError name="quantity" actionState={actionState} />
            </div>
          </SectionCard>

          <SectionCard
            title="Variants"
            description="Available sizes and colors — press Enter after each value"
          >
            <div className="flex flex-col gap-2">
              <Label>Sizes</Label>
              <ChipInput
                name="sizes"
                value={sizes}
                onChange={setSizes}
                placeholder="e.g. S, M, L, XL"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Colors</Label>
              <ChipInput
                name="colors"
                value={colors}
                onChange={setColors}
                placeholder="e.g. Black, Navy, Ivory"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Images"
            description="Main image shown in lists — gallery for the detail page"
          >
            <div className="flex flex-col gap-2">
              <Label>Main image</Label>
              <CloudinaryUploader
                signatureEndpoint="/api/sign-cloudinary-params"
                folder={CLOUDINARY_PRODUCTS_FOLDER}
                value={mainImage}
                onChange={setMainImage}
                aspectRatio="square"
                className="max-w-xs"
                label="Upload main image"
              />
              <FieldError name="imageId" actionState={actionState} />
              <FieldError name="imageUrl" actionState={actionState} />
            </div>
            <ProductImagesManager
              productId={product?.id}
              value={gallery}
              onChange={setGallery}
            />
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Status" description="Control visibility">
            <RadioGroup
              value={status}
              onValueChange={v => setStatus(v as ProductStatus)}
              className="gap-2"
            >
              {[
                {
                  v: ProductStatus.DRAFT,
                  label: "Draft",
                  hint: "Hidden from storefront",
                },
                {
                  v: ProductStatus.ACTIVE,
                  label: "Active",
                  hint: "Live on storefront",
                },
                {
                  v: ProductStatus.ARCHIVED,
                  label: "Archived",
                  hint: "Removed from listings",
                },
              ].map(opt => (
                <Label
                  key={opt.v}
                  htmlFor={`status-${opt.v}`}
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem id={`status-${opt.v}`} value={opt.v} />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.hint}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className="text-xs text-muted-foreground">
                  Highlight on the storefront home
                </p>
              </div>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>
          </SectionCard>

          <SectionCard
            title="Organization"
            description="Category, brand, and sub-categories"
          >
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onValueChange={v => {
                  setCategoryId(v);
                  setSubCategoryIds([]);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {formData.categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError name="categoryId" actionState={actionState} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Brand</Label>
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__NONE__">No brand</SelectItem>
                  {formData.brands.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Sub-categories</Label>
              <SubcategoriesMultiselect
                name="subCategoryIds"
                categoryId={categoryId || null}
                allSubCategories={formData.subCategories}
                value={subCategoryIds}
                onChange={setSubCategoryIds}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 mt-2 flex items-center justify-between gap-2 border-t bg-background/80 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          {mode === "edit" && product && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <LucideLoader2 className="size-4 animate-spin" />
              ) : (
                <LucideTrash2 className="size-4" />
              )}
              Delete
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" asChild>
            <Link
              href={
                mode === "edit" && product
                  ? `/admin/products/${product.id}`
                  : "/admin/products"
              }
            >
              Cancel
            </Link>
          </Button>
          <SubmitButton
            label={mode === "create" ? "Create product" : "Save changes"}
            icon={<LucideSave />}
          />
        </div>
      </div>
    </Form>
  );
}
